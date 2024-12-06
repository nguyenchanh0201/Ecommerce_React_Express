import Title from '../components/Title';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import CartToTal from '../components/CartTotal';

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  
  // Customer information state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { navigate } = useContext(ShopContext);

  // Download list of provinces/cities
  useEffect(() => {
    axios.get('https://provinces.open-api.vn/api/?depth=1')
      .then(response => {
        setCities(response.data);
      })
      .catch(error => {
        console.error('Error loading list of provinces/cities:', error);
      });
  }, []);

  // Download the list of districts when selecting a province/city
  useEffect(() => {
    if (selectedCity) {
      axios.get(`https://provinces.open-api.vn/api/p/${selectedCity}?depth=2`)
        .then(response => {
          setDistricts(response.data.districts);
          setWards([]); // Reset wards
          setSelectedDistrict('');
          setSelectedWard('');
        })
        .catch(error => {
          console.error('Error loading district list:', error);
        });
    }
  }, [selectedCity]);

  // Download the list of communes/wards when selecting a district/ward
  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then(response => {
          setWards(response.data.wards);
          setSelectedWard('');
        })
        .catch(error => {
          console.error('Error loading list of communes/wards:', error);
        });
    }
  }, [selectedDistrict]);

  // Handle form submission to place the order
  const handlePlaceOrder = () => {
    const orderData = {
      customer: {
        firstName,
        lastName,
        email,
        phone,
        address: {
          city: selectedCity,
          district: selectedDistrict,
          ward: selectedWard,
        },
      },
      paymentMethod: method,
      cartTotal: 100, // Replace this with actual cart total calculation
      // Add other order details here if necessary
    };

    // Send orderData to your backend or place order logic here
    console.log('Placing order with data:', orderData);

    // After order is placed, navigate to orders page
    navigate('/orders');
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={'DELIVERY '} text2={'INFORMATION'} />
        </div>
        <div className="flex gap-3">
          <input
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <input
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Dropdown Province/City */}
        <select
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">Select province/city</option>
          {cities.map((city) => (
            <option key={city.code} value={city.code}>
              {city.name}
            </option>
          ))}
        </select>

        {/* Dropdown District */}
        <select
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          disabled={!selectedCity}
        >
          <option value="">Select district</option>
          {districts.map((district) => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </select>

        {/* Dropdown Commune/Ward */}
        <select
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          disabled={!selectedDistrict}
        >
          <option value="">Select commune/ward</option>
          {wards.map((ward) => (
            <option key={ward.code} value={ward.code}>
              {ward.name}
            </option>
          ))}
        </select>

        <input
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Right Side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartToTal />
        </div>
        <div className="mt-12">
          <Title text1={'PAYMENT '} text2={'METHOD'} />
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod('cod')}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}
              ></p>
              <p className="text-gray-500 text-sm font-medium">CASH ON DELIVERY</p>
            </div>
          </div>
          <div className="w-full text-end mt-8">
            <button onClick={handlePlaceOrder} className="bg-black text-white px-16 py-3 text-sm">
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;