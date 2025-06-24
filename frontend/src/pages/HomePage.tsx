import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import axios from 'axios';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [inputType, setInputType] = useState<'url' | 'image'>('url');
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetchHistory(data.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchHistory(session.user.id);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchHistory = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:5004/api/feedback/history/${userId}`);
      setHistory(response.data.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue) return alert('Please provide input');
  
    setLoading(true);
    try {
      const aiResponse = await axios.post('http://localhost:5004/api/feedback/generate-feedback', {
        input_value: inputValue,
      });
  
      const generatedFeedback = aiResponse.data.feedback;
  
      const saveResponse = await axios.post('http://localhost:5004/api/feedback/save', {
        user_id: user.id,
        input_type: inputType,
        input_value: inputValue,
        feedback_json: generatedFeedback,
      });
  
      setFeedback(saveResponse.data.data);
      fetchHistory(user.id); // Refresh history after new feedback
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <p className="text-xl">Please login first</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mb-8">
        <h2 className="text-2xl font-bold text-center mb-6">UI/UX Feedback Tool</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Input Type:</label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value as 'url' | 'image')}
            className="w-full p-2 border rounded"
          >
            <option value="url">Website URL</option>
            <option value="image">Image Link</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">
            {inputType === 'url' ? 'Website URL' : 'Image Link'}:
          </label>
          <input
            type="text"
            placeholder={inputType === 'url' ? 'Enter URL' : 'Enter Image URL'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
        >
          {loading ? 'Analyzing...' : 'Get Feedback'}
        </button>

        {feedback && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Latest Feedback:</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
              {JSON.stringify(feedback.feedback_json, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-4">Your Feedback History</h3>
        {history.length === 0 ? (
          <p>No feedback history yet.</p>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {history.map((item) => (
              <div key={item.id} className="border p-3 rounded bg-gray-50">
                <p className="text-sm text-gray-600">Input: {item.input_value}</p>
                <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                  {JSON.stringify(item.feedback_json, null, 2)}
                </pre>
                <p className="text-xs text-gray-500 mt-1">Created at: {new Date(item.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
