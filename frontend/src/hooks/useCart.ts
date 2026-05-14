import { useState } from 'react';
import { useCart } from '../context/CartContext';

export function useCartActions() {
  const { addToCart, updateCartItem, removeFromCart, loading, error } = useCart();

  async function handleAddToCart(productId: string, quantity: number = 1) {
    await addToCart(productId, quantity);
  }

  async function handleUpdateCartItem(productId: string, quantity: number) {
    await updateCartItem(productId, quantity);
  }

  async function handleRemoveFromCart(productId: string) {
    await removeFromCart(productId);
  }

  return {
    addToCart: handleAddToCart,
    updateCartItem: handleUpdateCartItem,
    removeFromCart: handleRemoveFromCart,
    loading,
    error,
  };
}