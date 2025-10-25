import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, QrCode, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import QRCodeReact from 'qrcode.react';

const EventDetails = () => {
  const { id } = useParams();
  const { API } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [hasRSVP, setHasRSVP] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${API}/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    try {
      await axios.post(`${API}/events/${id}/rsvp`);
      toast.success('RSVP successful!');
      setHasRSVP(true);
      fetchEvent();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'RSVP failed');
    }
  };

  const handleCheckIn = async () => {
    try {
      await axios.post(`${API}/events/${id}/checkin`);
      toast.success('Checked in successfully!');
      setHasCheckedIn(true);
      fetchEvent();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Check-in failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="p-8">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {event.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
            <p className="text-lg text-gray-600">{event.description}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>{format(new Date(event.date), 'PPPP p')}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="h-5 w-5 text-green-600" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Users className="h-5 w-5 text-purple-600" />
              <span>{event.rsvp_count} RSVPs • {event.attendance_count} Attended</span>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            {!hasRSVP && (
              <Button 
                onClick={handleRSVP} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-6"
                data-testid="rsvp-btn"
              >
                RSVP to Event
              </Button>
            )}
            {hasRSVP && !hasCheckedIn && (
              <Button 
                onClick={handleCheckIn} 
                className="flex-1 bg-green-600 hover:bg-green-700 py-6"
                data-testid="checkin-btn"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Check In Now
              </Button>
            )}
            {hasCheckedIn && (
              <div className="flex-1 bg-green-100 text-green-700 rounded-lg p-6 text-center font-medium">
                <CheckCircle className="h-6 w-6 inline mr-2" />
                You're checked in!
              </div>
            )}
          </div>

          {event.qr_code && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <QrCode className="h-5 w-5 text-gray-600" />
                <h3 className="font-bold text-lg">QR Code for Check-in</h3>
              </div>
              <div className="inline-block bg-white p-4 rounded-lg shadow-sm">
                <img src={event.qr_code} alt="Event QR Code" className="w-48 h-48" data-testid="event-qr-code" />
              </div>
              <p className="text-sm text-gray-600 mt-4">Scan this code at the event to check in</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EventDetails;