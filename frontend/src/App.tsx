import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Layout/Navbar';
import GiftCardList from './components/GiftCard/GiftCardList';
import GiftCardDetails from './components/GiftCard/GiftCardDetails';
import Cart from './components/Cart/Cart';
import OrderStatus from './components/Order/OrderStatus';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<GiftCardList />} />
            <Route path="/giftcard/:id" element={<GiftCardDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order/:uid" element={<OrderStatus />} />
          </Routes>
        </main>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;