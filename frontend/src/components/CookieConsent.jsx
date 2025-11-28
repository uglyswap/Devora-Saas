import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShow(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 p-6 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Cookie className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-white mb-1">Nous utilisons des cookies</h3>
            <p className="text-sm text-gray-400">
              Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre{' '}
              <a href="/privacy" className="text-emerald-400 hover:underline">politique de confidentialité</a>.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={declineCookies}
            variant="outline"
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            Refuser
          </Button>
          <Button
            onClick={acceptCookies}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
