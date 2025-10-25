import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Award, Calendar, Download, ArrowLeft, Trophy } from 'lucide-react';
import { format } from 'date-fns';

const Portfolio = () => {
  const { user, API } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/student/${user.id}`);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const exportPortfolio = () => {
    const data = {
      name: user.name,
      email: user.email,
      eventsAttended: analytics.attendance_count,
      achievements: analytics.achievements,
      attendanceHistory: analytics.attendance_history
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.name}_portfolio.json`;
    a.click();
    toast.success('Portfolio exported!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getBadgeColor = (type) => {
    switch (type) {
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost"
            data-testid="back-btn"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={exportPortfolio}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="export-btn"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Portfolio
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Digital Portfolio</h1>
          <p className="text-gray-600">Your complete participation record and achievements</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Events Attended</p>
                <p className="text-4xl font-bold text-blue-600">{analytics.attendance_count}</p>
              </div>
              <Calendar className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Achievements</p>
                <p className="text-4xl font-bold text-green-600">{analytics.achievements.length}</p>
              </div>
              <Trophy className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Participation Rate</p>
                <p className="text-4xl font-bold text-purple-600">Active</p>
              </div>
              <Award className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Achievements & Badges</h2>
          {analytics.achievements.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.achievements.map((achievement) => (
                <Card key={achievement.id} className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-full ${getBadgeColor(achievement.badge_type)} flex items-center justify-center text-white`}>
                      <Trophy className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <Badge className={`${getBadgeColor(achievement.badge_type)} text-white text-xs`}>
                        {achievement.badge_type.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-2">
                        Earned {format(new Date(achievement.earned_at), 'PP')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No achievements yet. Attend more events to earn badges!</p>
            </Card>
          )}
        </section>

        {/* Attendance History */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Attendance History</h2>
          {analytics.attendance_history.length > 0 ? (
            <Card className="divide-y">
              {analytics.attendance_history.map((attendance) => (
                <div key={attendance.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Event #{attendance.event_id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        Checked in on {format(new Date(attendance.checked_in_at), 'PPP p')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Attended</Badge>
                </div>
              ))}
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance history yet. Start attending events!</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};

export default Portfolio;