import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { TrendingUp, Users, Calendar, DollarSign, LogOut } from 'lucide-react';

const FacultyDashboard = () => {
  const { user, logout, API } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get(`${API}/clubs`);
      setClubs(response.data);
    } catch (error) {
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold">Faculty Mentor Dashboard</h1>
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
          <p className="text-gray-600 text-lg">Monitor assigned clubs and their activities</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Clubs</p>
                <p className="text-3xl font-bold text-blue-600">{clubs.length}</p>
              </div>
              <Users className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Members</p>
                <p className="text-3xl font-bold text-green-600">
                  {clubs.reduce((sum, club) => sum + club.member_count, 0)}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Clubs</p>
                <p className="text-3xl font-bold text-purple-600">{clubs.length}</p>
              </div>
              <Calendar className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-6 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Compliance</p>
                <p className="text-3xl font-bold text-orange-600">100%</p>
              </div>
              <DollarSign className="h-12 w-12 text-orange-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Clubs List */}
        <section>
          <h3 className="text-2xl font-bold mb-4">Assigned Clubs</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <Card key={club.id} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="mb-4">
                  <Badge className="mb-3">{club.category}</Badge>
                  <h4 className="font-bold text-xl mb-2">{club.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{club.description}</p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <span className="font-medium">{club.member_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coordinators:</span>
                    <span className="font-medium">{club.coordinator_ids.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Treasurers:</span>
                    <span className="font-medium">{club.treasurer_ids.length}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
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

export default FacultyDashboard;