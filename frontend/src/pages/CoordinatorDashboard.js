import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Plus, Calendar, CheckSquare, Users, LogOut, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const CoordinatorDashboard = () => {
  const { user, logout, API } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [eventForm, setEventForm] = useState({
    club_id: user.club_id || 'default-club',
    title: '',
    description: '',
    date: '',
    location: '',
    tags: '',
    max_attendees: ''
  });

  const [taskForm, setTaskForm] = useState({
    club_id: user.club_id || 'default-club',
    title: '',
    description: '',
    assigned_to: '',
    deadline: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, tasksRes] = await Promise.all([
        axios.get(`${API}/events`),
        axios.get(`${API}/tasks`)
      ]);
      setEvents(eventsRes.data);
      setTasks(tasksRes.data);
      
      if (user.club_id) {
        const analyticsRes = await axios.get(`${API}/analytics/club/${user.club_id}`);
        setAnalytics(analyticsRes.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/events`, {
        ...eventForm,
        tags: eventForm.tags.split(',').map(t => t.trim()),
        max_attendees: eventForm.max_attendees ? parseInt(eventForm.max_attendees) : null
      });
      toast.success('Event created successfully!');
      setShowEventDialog(false);
      setEventForm({ club_id: user.club_id || 'default-club', title: '', description: '', date: '', location: '', tags: '', max_attendees: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/tasks`, taskForm);
      toast.success('Task created successfully!');
      setShowTaskDialog(false);
      setTaskForm({ club_id: user.club_id || 'default-club', title: '', description: '', assigned_to: '', deadline: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await axios.put(`${API}/tasks/${taskId}?status=${status}`);
      toast.success('Task updated!');
      fetchData();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
          <Button variant="ghost" onClick={logout} data-testid="logout-btn">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Welcome, {user.name}!</h2>
          <p className="text-gray-600 text-lg">Manage your club events and tasks</p>
        </div>

        {/* Stats */}
        {analytics && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Events</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics.total_events}</p>
                </div>
                <Calendar className="h-12 w-12 text-blue-600 opacity-20" />
              </div>
            </Card>
            <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total RSVPs</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.total_rsvps}</p>
                </div>
                <Users className="h-12 w-12 text-green-600 opacity-20" />
              </div>
            </Card>
            <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Attendance</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics.total_attendance}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-600 opacity-20" />
              </div>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-event-btn">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    data-testid="event-title-input"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="event-description-input"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      data-testid="event-date-input"
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      data-testid="event-location-input"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    data-testid="event-tags-input"
                    placeholder="Tech, Workshop, Cultural"
                    value={eventForm.tags}
                    onChange={(e) => setEventForm({ ...eventForm, tags: e.target.value })}
                  />
                </div>
                <Button type="submit" data-testid="submit-event-btn" className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Event
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="create-task-btn">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    data-testid="task-title-input"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    data-testid="task-description-input"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="assigned-to">Assign To (User ID)</Label>
                  <Input
                    id="assigned-to"
                    data-testid="task-assigned-input"
                    value={taskForm.assigned_to}
                    onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    data-testid="task-deadline-input"
                    type="datetime-local"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" data-testid="submit-task-btn" className="w-full">
                  Create Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Your Events</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <Card key={event.id} className="p-6">
                <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(event.date), 'PPP')}
                </div>
                <div className="flex gap-2 text-sm">
                  <Badge variant="secondary">{event.rsvp_count} RSVPs</Badge>
                  <Badge variant="secondary">{event.attendance_count} Attended</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Tasks */}
        <section>
          <h3 className="text-2xl font-bold mb-4">Tasks</h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Deadline: {format(new Date(task.deadline), 'PPP')}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={`${task.status === 'completed' ? 'bg-green-600' : task.status === 'in-progress' ? 'bg-yellow-600' : 'bg-gray-600'} text-white`}
                >
                  {task.status}
                </Badge>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;