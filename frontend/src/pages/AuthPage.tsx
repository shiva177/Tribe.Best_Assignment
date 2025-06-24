import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function AuthPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100 flex-col space-y-4">
        <p className="text-xl">Logged in as {user.email}</p>
        <button onClick={signOut} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
        <a href="/home" className="text-blue-500 underline">Go to Home</a>
      </div>
    );
  }

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">Login / Signup</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-2">
          <button onClick={signUp} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded">Sign Up</button>
          <button onClick={signIn} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">Login</button>
        </div>
      </div>
    </div>
  );
}
