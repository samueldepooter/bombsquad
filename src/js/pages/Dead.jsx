import React from 'react';

const Dead = () => {
  return (
    <section>
      <p>You are dead</p>
      {/* a tag om alle variabelen te refreshen, kan ook link zijn maar moet dan handmatig alle variabelen van deze player updaten */}
      <a href='/'>Menu</a>
    </section>
  );
};

export default Dead;
