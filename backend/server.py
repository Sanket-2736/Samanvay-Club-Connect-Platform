from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import qrcode
import io
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-this')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str  # student, coordinator, treasurer, faculty, admin
    club_id: Optional[str] = None
    interests: List[str] = []  # For AI recommendations
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Club(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # Tech, Arts, Sports, etc.
    coordinator_ids: List[str] = []
    treasurer_ids: List[str] = []
    faculty_mentor_ids: List[str] = []
    member_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    club_id: str
    title: str
    description: str
    date: datetime
    location: str
    tags: List[str] = []  # Tech, Workshop, Cultural, etc.
    qr_code: Optional[str] = None
    max_attendees: Optional[int] = None
    rsvp_count: int = 0
    attendance_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    club_id: str
    title: str
    description: str
    date: datetime
    location: str
    tags: List[str] = []
    max_attendees: Optional[int] = None

class RSVP(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    user_id: str
    status: str  # confirmed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Attendance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    user_id: str
    checked_in_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    club_id: str
    title: str
    description: str
    assigned_to: str  # user_id
    deadline: datetime
    status: str  # pending, in-progress, completed
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(BaseModel):
    club_id: str
    title: str
    description: str
    assigned_to: str
    deadline: datetime

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    club_id: str
    type: str  # income, expense
    amount: float
    category: str
    description: str
    receipt_url: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    club_id: str
    type: str
    amount: float
    category: str
    description: str
    receipt_url: Optional[str] = None

class Achievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str
    badge_type: str  # bronze, silver, gold
    earned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        return User(**user_doc)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_qr_code(data: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

# Auth Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# User Routes
@api_router.put("/users/profile", response_model=User)
async def update_profile(name: str, current_user: User = Depends(get_current_user)):
    await db.users.update_one({"id": current_user.id}, {"$set": {"name": name}})
    current_user.name = name
    return current_user

@api_router.put("/users/interests")
async def update_interests(interests: List[str], current_user: User = Depends(get_current_user)):
    await db.users.update_one({"id": current_user.id}, {"$set": {"interests": interests}})
    return {"message": "Interests updated"}

# Club Routes
@api_router.get("/clubs", response_model=List[Club])
async def get_clubs():
    clubs = await db.clubs.find({}, {"_id": 0}).to_list(1000)
    for club in clubs:
        if isinstance(club.get('created_at'), str):
            club['created_at'] = datetime.fromisoformat(club['created_at'])
    return clubs

@api_router.post("/clubs", response_model=Club)
async def create_club(club: Club, current_user: User = Depends(get_current_user)):
    if current_user.role not in ['admin']:
        raise HTTPException(status_code=403, detail="Only admins can create clubs")
    
    club_dict = club.model_dump()
    club_dict['created_at'] = club_dict['created_at'].isoformat()
    await db.clubs.insert_one(club_dict)
    return club

@api_router.get("/clubs/{club_id}", response_model=Club)
async def get_club(club_id: str):
    club = await db.clubs.find_one({"id": club_id}, {"_id": 0})
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    if isinstance(club.get('created_at'), str):
        club['created_at'] = datetime.fromisoformat(club['created_at'])
    return Club(**club)

# Event Routes
@api_router.get("/events", response_model=List[Event])
async def get_events(tag: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if tag:
        query['tags'] = tag
    
    events = await db.events.find(query, {"_id": 0}).to_list(1000)
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        if isinstance(event.get('date'), str):
            event['date'] = datetime.fromisoformat(event['date'])
    
    return events

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in ['coordinator', 'admin']:
        raise HTTPException(status_code=403, detail="Only coordinators can create events")
    
    event = Event(**event_data.model_dump())
    
    # Generate QR code for attendance
    qr_data = f"event:{event.id}"
    event.qr_code = generate_qr_code(qr_data)
    
    event_dict = event.model_dump()
    event_dict['created_at'] = event_dict['created_at'].isoformat()
    event_dict['date'] = event_dict['date'].isoformat()
    
    await db.events.insert_one(event_dict)
    return event

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if isinstance(event.get('created_at'), str):
        event['created_at'] = datetime.fromisoformat(event['created_at'])
    if isinstance(event.get('date'), str):
        event['date'] = datetime.fromisoformat(event['date'])
    return Event(**event)

@api_router.post("/events/{event_id}/rsvp")
async def rsvp_event(event_id: str, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already RSVP'd
    existing_rsvp = await db.rsvps.find_one({"event_id": event_id, "user_id": current_user.id})
    if existing_rsvp:
        raise HTTPException(status_code=400, detail="Already RSVP'd")
    
    rsvp = RSVP(event_id=event_id, user_id=current_user.id, status="confirmed")
    rsvp_dict = rsvp.model_dump()
    rsvp_dict['created_at'] = rsvp_dict['created_at'].isoformat()
    
    await db.rsvps.insert_one(rsvp_dict)
    await db.events.update_one({"id": event_id}, {"$inc": {"rsvp_count": 1}})
    
    return {"message": "RSVP successful"}

@api_router.delete("/events/{event_id}/rsvp")
async def cancel_rsvp(event_id: str, current_user: User = Depends(get_current_user)):
    result = await db.rsvps.delete_one({"event_id": event_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="RSVP not found")
    
    await db.events.update_one({"id": event_id}, {"$inc": {"rsvp_count": -1}})
    return {"message": "RSVP cancelled"}

@api_router.post("/events/{event_id}/checkin")
async def checkin_event(event_id: str, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already checked in
    existing_attendance = await db.attendance.find_one({"event_id": event_id, "user_id": current_user.id})
    if existing_attendance:
        raise HTTPException(status_code=400, detail="Already checked in")
    
    attendance = Attendance(event_id=event_id, user_id=current_user.id)
    attendance_dict = attendance.model_dump()
    attendance_dict['checked_in_at'] = attendance_dict['checked_in_at'].isoformat()
    
    await db.attendance.insert_one(attendance_dict)
    await db.events.update_one({"id": event_id}, {"$inc": {"attendance_count": 1}})
    
    # Check for achievements
    attendance_count = await db.attendance.count_documents({"user_id": current_user.id})
    if attendance_count == 1:
        achievement = Achievement(
            user_id=current_user.id,
            title="First Event",
            description="Attended your first event!",
            badge_type="bronze"
        )
        achievement_dict = achievement.model_dump()
        achievement_dict['earned_at'] = achievement_dict['earned_at'].isoformat()
        await db.achievements.insert_one(achievement_dict)
    elif attendance_count == 10:
        achievement = Achievement(
            user_id=current_user.id,
            title="Active Participant",
            description="Attended 10 events!",
            badge_type="silver"
        )
        achievement_dict = achievement.model_dump()
        achievement_dict['earned_at'] = achievement_dict['earned_at'].isoformat()
        await db.achievements.insert_one(achievement_dict)
    elif attendance_count == 50:
        achievement = Achievement(
            user_id=current_user.id,
            title="Campus Legend",
            description="Attended 50 events!",
            badge_type="gold"
        )
        achievement_dict = achievement.model_dump()
        achievement_dict['earned_at'] = achievement_dict['earned_at'].isoformat()
        await db.achievements.insert_one(achievement_dict)
    
    return {"message": "Checked in successfully"}

# Task Routes
@api_router.get("/tasks")
async def get_tasks(club_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if club_id:
        query['club_id'] = club_id
    if current_user.role == 'coordinator':
        query['$or'] = [{"created_by": current_user.id}, {"assigned_to": current_user.id}]
    elif current_user.role == 'student':
        query['assigned_to'] = current_user.id
    
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(1000)
    for task in tasks:
        if isinstance(task.get('created_at'), str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
        if isinstance(task.get('deadline'), str):
            task['deadline'] = datetime.fromisoformat(task['deadline'])
    return tasks

@api_router.post("/tasks")
async def create_task(task_data: TaskCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in ['coordinator', 'admin']:
        raise HTTPException(status_code=403, detail="Only coordinators can create tasks")
    
    task = Task(**task_data.model_dump(), created_by=current_user.id, status="pending")
    task_dict = task.model_dump()
    task_dict['created_at'] = task_dict['created_at'].isoformat()
    task_dict['deadline'] = task_dict['deadline'].isoformat()
    
    await db.tasks.insert_one(task_dict)
    return {"message": "Task created", "task": task}

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, status: str, current_user: User = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.tasks.update_one({"id": task_id}, {"$set": {"status": status}})
    return {"message": "Task updated"}

# Finance Routes
@api_router.get("/finances")
async def get_transactions(club_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role not in ['treasurer', 'coordinator', 'faculty', 'admin']:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    transactions = await db.transactions.find({"club_id": club_id}, {"_id": 0}).to_list(1000)
    for transaction in transactions:
        if isinstance(transaction.get('created_at'), str):
            transaction['created_at'] = datetime.fromisoformat(transaction['created_at'])
    
    # Calculate balance
    income = sum(t['amount'] for t in transactions if t['type'] == 'income')
    expense = sum(t['amount'] for t in transactions if t['type'] == 'expense')
    balance = income - expense
    
    return {
        "transactions": transactions,
        "balance": balance,
        "income": income,
        "expense": expense
    }

@api_router.post("/finances")
async def create_transaction(transaction_data: TransactionCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in ['treasurer', 'coordinator', 'admin']:
        raise HTTPException(status_code=403, detail="Only treasurers can add transactions")
    
    transaction = Transaction(**transaction_data.model_dump(), created_by=current_user.id)
    transaction_dict = transaction.model_dump()
    transaction_dict['created_at'] = transaction_dict['created_at'].isoformat()
    
    await db.transactions.insert_one(transaction_dict)
    return {"message": "Transaction added", "transaction": transaction}

# Analytics Routes
@api_router.get("/analytics/student/{user_id}")
async def get_student_analytics(user_id: str):
    attendance = await db.attendance.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    achievements = await db.achievements.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    for item in attendance:
        if isinstance(item.get('checked_in_at'), str):
            item['checked_in_at'] = datetime.fromisoformat(item['checked_in_at'])
    
    for item in achievements:
        if isinstance(item.get('earned_at'), str):
            item['earned_at'] = datetime.fromisoformat(item['earned_at'])
    
    return {
        "attendance_count": len(attendance),
        "achievements": achievements,
        "attendance_history": attendance
    }

@api_router.get("/analytics/club/{club_id}")
async def get_club_analytics(club_id: str, current_user: User = Depends(get_current_user)):
    events = await db.events.find({"club_id": club_id}, {"_id": 0}).to_list(1000)
    
    total_events = len(events)
    total_rsvps = sum(e.get('rsvp_count', 0) for e in events)
    total_attendance = sum(e.get('attendance_count', 0) for e in events)
    
    return {
        "total_events": total_events,
        "total_rsvps": total_rsvps,
        "total_attendance": total_attendance,
        "events": events
    }

# AI Recommendations
@api_router.get("/recommendations")
async def get_recommendations(current_user: User = Depends(get_current_user)):
    try:
        # Get user's interests and past attendance
        user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
        interests = user_doc.get('interests', [])
        
        # Get upcoming events
        now = datetime.now(timezone.utc)
        events = await db.events.find({}, {"_id": 0}).to_list(1000)
        
        # Filter upcoming events
        upcoming_events = []
        for event in events:
            event_date = event.get('date')
            if isinstance(event_date, str):
                event_date = datetime.fromisoformat(event_date)
            if event_date > now:
                upcoming_events.append(event)
        
        if not upcoming_events:
            return {"recommended_events": [], "message": "No upcoming events"}
        
        # Use Gemini to recommend events
        gemini_api_key = os.environ.get('GEMINI_API_KEY')
        if not gemini_api_key:
            # Fallback to simple tag matching
            recommended = [e for e in upcoming_events if any(tag in interests for tag in e.get('tags', []))]
            return {"recommended_events": recommended[:5]}
        
        # Prepare event data for AI
        events_text = "\n".join([
            f"- {e['title']}: {e['description']} (Tags: {', '.join(e.get('tags', []))})"
            for e in upcoming_events
        ])
        
        prompt = f"""User interests: {', '.join(interests) if interests else 'None specified'}

Upcoming events:
{events_text}

Based on the user's interests, recommend the top 3-5 most relevant events. Return only the event titles, one per line, nothing else."""
        
        chat = LlmChat(
            api_key=gemini_api_key,
            session_id=f"recommendations_{current_user.id}",
            system_message="You are an event recommendation assistant. Recommend events that match user interests."
        ).with_model("gemini", "gemini-2.0-flash")
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        # Parse AI response
        recommended_titles = [line.strip() for line in response.strip().split('\n') if line.strip()]
        recommended_events = [e for e in upcoming_events if e['title'] in recommended_titles]
        
        return {"recommended_events": recommended_events[:5]}
    
    except Exception as e:
        logging.error(f"Error in recommendations: {str(e)}")
        # Fallback to simple recommendation
        return {"recommended_events": upcoming_events[:5]}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()