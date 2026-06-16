'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getProfile } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('EN');

  useEffect(() => {
    const token = Cookies.get('jimat_token');
    const savedLang = localStorage.getItem('jimat_lang') || 'EN';
    setLang(savedLang);

    if (token) {
      getProfile()
        .then(res => {
          setUser(res.data.user);
          setLang(res.data.user.language || savedLang);
        })
        .catch(() => {
          Cookies.remove('jimat_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    Cookies.set('jimat_token', token, { expires: 30 });
    setUser(userData);
    setLang(userData.language || 'EN');
  };

  const logoutUser = () => {
    Cookies.remove('jimat_token');
    setUser(null);
    window.location.href = '/login';
  };

  const toggleLang = () => {
    const newLang = lang === 'EN' ? 'BM' : 'EN';
    setLang(newLang);
    localStorage.setItem('jimat_lang', newLang);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, lang, toggleLang, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);