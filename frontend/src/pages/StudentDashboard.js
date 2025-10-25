import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Calendar, Award, LogOut, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const StudentDashboard = () => {
  const { user, logout, API } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recsRes, eventsRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/recommendations`),
        axios.get(`${API}/events`),
        axios.get(`${API}/analytics/student/${user.id}`)
      ]);
      setRecommendations(recsRes.data.recommended_events || []);
      setEvents(eventsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      await axios.post(`${API}/events/${eventId}/rsvp`);
      toast.success('RSVP successful!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'RSVP failed');
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
          <div className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Smart Club Connect
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/events')} data-testid="nav-events-btn">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </Button>
            <Button variant="ghost" onClick={() => navigate('/portfolio')} data-testid="nav-portfolio-btn">
              <Award className="h-4 w-4 mr-2" />
              Portfolio
            </Button>
            <Button variant="ghost" onClick={logout} data-testid="logout-btn">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-blue-600" />
            <h2 className="text-4xl font-bold">Welcome, {user.name}!</h2>
          </div>
          <p className="text-gray-600 text-lg">Discover events tailored just for you</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Events Attended</p>
                <p className="text-3xl font-bold text-blue-600">{analytics?.attendance_count || 0}</p>
              </div>
              <Calendar className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Achievements</p>
                <p className="text-3xl font-bold text-green-600">{analytics?.achievements?.length || 0}</p>
              </div>
              <Award className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold text-purple-600">{events.length}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h3 className="text-2xl font-bold">Recommended For You</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((event) => (
                <Card key={event.id} className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-blue-200">
                  <div className="mb-4">
                    <Badge className="bg-gradient-to-r from-blue-600 to-green-600 text-white mb-3">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Recommended
                    </Badge>
                    <h4 className="font-bold text-xl mb-2">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(event.date), 'PPP p')}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate(`/events/${event.id}`)} 
                      variant="outline" 
                      className="flex-1"
                      data-testid={`view-event-${event.id}-btn`}
                    >
                      View Details
                    </Button>
                    <Button 
                      onClick={() => handleRSVP(event.id)} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      data-testid={`rsvp-event-${event.id}-btn`}
                    >
                      RSVP
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Events */}
        <section>
          <h3 className="text-2xl font-bold mb-4">All Upcoming Events</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <Card key={event.id} className="p-6 hover:shadow-lg transition-all duration-300">
                <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(event.date), 'PPP')}
                </div>
                <Button 
                  onClick={() => navigate(`/events/${event.id}`)} 
                  variant="outline" 
                  className="w-full"
                  data-testid={`view-all-event-${event.id}-btn`}
                >
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;