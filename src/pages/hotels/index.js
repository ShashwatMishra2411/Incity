import React, { useEffect, useState } from 'react';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API;

const useGoogleMapsApi = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  return isLoaded;
};

function Hotels() {
  const isGoogleMapsLoaded = useGoogleMapsApi();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (!currentLocation || !isGoogleMapsLoaded) return;

      const center = new google.maps.LatLng(
        currentLocation.lat,
        currentLocation.lng
      );
      const request = {
        fields: ['name', 'geometry', 'vicinity'],
        location: center,
        radius: 500,
        type: ['mixing_bowls'],
      };

      const service = new google.maps.places.PlacesService(document.createElement('div'));

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          setPlaces(results);
        } else {
          console.error('Error fetching places:', status);
        }
      });
    };

    fetchNearbyPlaces();
  }, [currentLocation, isGoogleMapsLoaded]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div>
      <h1>Current Location</h1>
      {currentLocation ? (
        <div>
          <p><strong>Latitude:</strong> {currentLocation.lat}</p>
          <p><strong>Longitude:</strong> {currentLocation.lng}</p>
          <h2>Nearby Restaurants</h2>
          {places.length > 0 ? (
            places.map((place) => (
              <div key={place.place_id} className="card">
                <h2>{place.name}</h2>
                <p>{place.vicinity}</p>
              </div>
            ))
          ) : (
            <p>No nearby restaurants found.</p>
          )}
        </div>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
}

export default Hotels;
