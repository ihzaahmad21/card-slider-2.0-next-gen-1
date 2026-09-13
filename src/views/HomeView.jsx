import React from 'react';
import Hero from '../components/Hero.jsx';

export default function HomeView({ cards, onStartGacha, onOpenInventory, onOpenShowcase, onSelectCard, inventory }) {
  return (
    <section className="view active" id="view-home">
      <Hero
        cards={cards}
        inventory={inventory}
        onOpenShop={onStartGacha}
        onOpenInventory={onOpenInventory}
        onOpenShowcase={onOpenShowcase}
        onSelectCard={onSelectCard}
      />
    </section>
  );
}