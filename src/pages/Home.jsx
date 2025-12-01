import { useState } from 'react';
import FlightSearch from '../components/FlightSearch';
import FlightResults from '../components/FlightResults';
import { searchFlights } from '../services/mockFlightApi';

const Home = () => {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (flightNumber) => {
    setIsLoading(true);
    setSearchTerm(flightNumber);

    try {
      const results = await searchFlights(flightNumber);
      setFlights(results);
    } catch (error) {
      console.error('Error searching flights:', error);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FlightSearch onSearch={handleSearch} isLoading={isLoading} />
      {isLoading && (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {!isLoading && <FlightResults flights={flights} searchTerm={searchTerm} />}
    </>
  );
};

export default Home;
