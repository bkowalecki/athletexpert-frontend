// src/data/blogTemplates.ts

export interface BlogTemplate {
  name: string;
  html: string;
}

// src/data/blogTemplates.ts

export const blogTemplates = [
  {
    name: "Top 10 Products",
    html: `<section class="top-10-products-section">
  
    <!-- Intro -->
    <p class="template-intro">
      Looking for the best kicks to take your running game to the next level? We’ve got you covered.
      Here's our list of the top 10 running shoes that athletes are raving about this year.
    </p>
  
    <!-- Product List -->
    <ol class="product-list">
  
      <!-- Product 1 -->
      <li>
        <h3 class="product-title">
          Nike ZoomX Vaporfly Next%
          <span class="product-badge">#1 Pick</span>
        </h3>
        <a
          href="https://www.amazon.com/dp/YOURID?tag=athletexpert-20"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buy Nike ZoomX Vaporfly Next%">
          <div class="image-wrapper">
            <img
              src="https://via.placeholder.com/600x400"
              alt="Nike ZoomX Running Shoe – lightweight and fast"
              class="responsive-img"
            />
          </div>
        </a>
        <p class="product-description">
          Designed for speed and comfort, this shoe is a marathoner’s dream.
          Lightweight ZoomX foam and a carbon fiber plate offer maximum energy return.
        </p>
      </li>
  
      <!-- Product 2 -->
      <li>
        <h3 class="product-title">Adidas Adizero Adios Pro 3</h3>
        <a
          href="https://www.amazon.com/dp/YOURID?tag=athletexpert-20"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buy Adidas Adizero Adios Pro 3">
          <div class="image-wrapper">
            <img
              src="https://via.placeholder.com/600x400"
              alt="Adidas Adizero Adios Pro 3 – top for distance runs"
              class="responsive-img"
            />
          </div>
        </a>
        <p class="product-description">
          Built for elite performance and long-distance races. Lightweight and aggressive,
          it’s a fan favorite among serious racers.
        </p>
      </li>
  
      <!-- Product 3 -->
      <li>
        <h3 class="product-title">Hoka One One Clifton 9</h3>
        <a
          href="https://www.amazon.com/dp/YOURID?tag=athletexpert-20"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buy Hoka One One Clifton 9">
          <div class="image-wrapper">
            <img
              src="https://via.placeholder.com/600x400"
              alt="Hoka Clifton 9 – known for comfort and support"
              class="responsive-img"
            />
          </div>
        </a>
        <p class="product-description">
          Great for everyday runs with unbeatable cushioning. If you want comfort and support, this one’s for you.
        </p>
      </li>
  
      <!-- More products go here -->
  
    </ol>
  
    <!-- Closing Callout -->
    <p class="closing-callout">
      Every athlete has different needs — choose the pair that matches your style and training goals.
      And don’t forget to break them in before race day!
    </p>

    <!-- Amazon Affiliate Disclaimer -->
    <p class="affiliate-disclaimer" style="font-style: italic; font-size: 0.95rem; margin-bottom: 2rem;">
      As an Amazon Associate, I earn from qualifying purchases. This post contains affiliate links.
    </p>
  
  </section>`
  }
  ,
  {
    name: "Training Guide",
    html: `
    <p class="template-intro">Think strength training isn’t for runners? Think again. Strength training can improve your endurance, prevent injuries, and make you faster.</p>

    <h3>Why Strength Matters</h3>
    <p>Runners often neglect the weight room, but it’s the secret sauce behind many elite performances. Strong glutes, hips, and core = better efficiency and fewer injuries.</p>

    <h3>Beginner-Friendly Routines</h3>
    <ul>
      <li>✅ Bodyweight squats: Build strength in your quads and glutes.</li>
      <li>✅ Lunges: Improve stability and correct imbalances.</li>
      <li>✅ Planks: Strengthen your core to support proper form.</li>
    </ul>

    <p class="closing-callout">Start with 2 sessions per week, focusing on form and control. You’ll feel stronger within weeks—and your pace might thank you.</p>
  `,
  },
  {
    name: "Pop Culture Take",
    html: `
        <p class="template-intro">We break down the leadership lessons — and football fantasies — from TV’s most lovable coach.</p>
  
        <h3>The Good</h3>
        <ul>
          <li>Positive mindset is infectious</li>
          <li>Culture over strategy</li>
        </ul>
  
        <h3>The Questionable</h3>
        <ul>
          <li>Seriously, where are the tactics?</li>
          <li>Can belief really beat elite tactics?</li>
        </ul>
      `,
  },
  {
    name: "Affiliate Product Feature",
    html: `
        <div class="affiliate-block">
          <h3>Nike Air Zoom Pegasus 41 <span class="product-badge">#1 Pick</span></h3>
          <a href="https://your-affiliate-link.com" target="_blank" rel="noopener noreferrer">
            <img src="https://via.placeholder.com/600x350" alt="Nike Pegasus Shoe" class="responsive-img" />
          </a>
          <p class="affiliate-description">The perfect balance of comfort and bounce — a daily trainer that never quits.</p>
          <a href="https://your-affiliate-link.com" target="_blank" class="affiliate-cta">View on Amazon</a>
        </div>
      `,
  },
  {
    name: "Comparison Table",
    html: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Weight</th>
              <th scope="col">Best For</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nike Pegasus 41</td>
              <td>9.2 oz</td>
              <td>Daily Training</td>
              <td>$130</td>
            </tr>
            <tr>
              <td>Adidas Ultraboost Light</td>
              <td>10.5 oz</td>
              <td>Cushioned Comfort</td>
              <td>$180</td>
            </tr>
          </tbody>
        </table>
      `,
  },
];
