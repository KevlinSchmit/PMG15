export const marketContent = {
  tam: {
    label: 'TOTAL ADDRESSABLE MARKET',
    value: '$230,000,000',
    description: 'Based on U.S. recreational and commercial fishing assumptions.',
    html: `<h3>TAM - Total Addressable Market</h3>
      <div class="market-text-grid"><div><p>As our products currently targets to U.S market, number of people who participates in the recreational fishing industry and the number of people who employs in the commercial fishing industry is taking into accountability for the calculation of the total addressable market.</p>
      <ul><li>57 Million U.S. Citizens participated in recreational fishing until 2025</li><li>51,902 U.S. Citizens are employed in the commercial fishing industry until 2025</li></ul></div>
      <div><h4>Assumptions:</h4><ul><li>Assuming 20% of the people who once fished is an amateur angler</li><li>Assuming 10% of the amateur angler would purchase our product</li><li>Assuming 30% of the commercial angler would purchase our product</li><li>Assuming all customer would spend 199$ annually on our product (the retail price of a fishing rod)</li></ul></div></div>
      <div class="calculation"><small>Calculations:</small>TAM = (5700,000,0 * 0.2 * 0.1 + 51902 * 0.3) * 199 = <strong>$ 230,000,000</strong></div>`
  },
  sam: {
    label: 'SERVICEABLE AVAILABLE MARKET',
    value: '$117,967,200',
    description: 'Based on 52% serviceability / integration feasibility.',
    html: `<h3>SAM - Serviceable Available Market</h3>
      <div class="market-text-grid"><div><p><b>Total number of potential customers:</b> 1.14 million - Established based on previous assumption</p><p><b>Average Annual Revenue per Customer:</b> $199 - The retail price of a single fishing rod</p><h4>Percentage of Customers we can serve:</h4><p>The statistics of serviceable customers in the market is highly dependent on the availability of the technology. Our product makes usage of a combination of three types of exponential technology: Artificial Intelligence, Miniaturized camera technology, and Real-time 3D visualization</p></div>
      <div><h4>Assumptions:</h4><ul><li>Existing technology of AI tool - Fishial - has an identification ability of detecting over 865 types of fish, while real life oceanic environment is still needed to be trained. Percentage availability: 70%</li><li>Waterproof, high resolution, and mini underwater camera is highly available, but short delay of image still needs to be explored. Percentage availability: 76%</li><li>Mature technology like Apple AR Quick look can demonstrate 3D models. Percentage availability: 90%</li></ul></div></div>
      <div class="calculation"><small>Calculation: (70% + 76% + 90%) / 3 = 52%</small>SAM = 1,140,000 customers * $199 * 52% = <strong>$ 117,967,200</strong></div>`
  },
  som: {
    label: 'SERVICE OBTAINABLE MARKET',
    value: '$1,179,672',
    description: 'Based on 1% market capture assumption.',
    html: `<h3>SOM - Service Obtainable Market</h3>
      <div class="market-text-grid"><div><p><b>Number potential customers:</b> 1.14 million / <b>Average Annual Revenue per Customer:</b> $199</p><p><b>Percentage of Customers we can serve:</b> 52%</p><h4>Percentage of market you can capture:</h4><p>The capture rate is calculated by using the percentage of potential customers who has the desire to purchase over the total number who had the opportunity.</p></div>
      <div><p>To this end, based on our estimated production, distribution, and early adoption capacity, we assume that 5,000 customers would purchase our product annually in the first three years. Therefore, percentage of market captured is calculated by:</p><p>5000 / 592800 = 0.84%</p><p>Rounding up the percentage to 1%, the number for our SOM is:</p></div></div>
      <div class="calculation">SOM = 1,140,000 * 52% * 1% * $199 = <strong>$1,179,672</strong></div>`
  }
};

export const interviews = [
  {
    label: '#1 Interviewee: professional fisher / Interview date: September 26, 2026',
    points: [
      'Agreed the idea of using a camera and AI to identify fish before they are hooked is really useful',
      'He liked that the system would immediately retract the hooks when it detects a protected species rather than relying on humans to recognize the animal after the damage already happened.',
      'However, he was concerned about how accurately the AI could identify fish underwater, especially in low-light conditions. In addition, he was more interested if the product offered everyday fishing benefits.'
    ]
  },
  {
    label: '#2: Interviewee: occasional fisher / Interview date: September 27, 2026',
    points: [
      'The interviewee doesn’t fish too often, but she liked how the concept adds a layer of education to fishing.',
      'She thought showing the protected fishes on screen with 3D models and fun facts could make fishing more interesting for people who are not experienced anglers.',
      'concerned that the technology might be complicated for people who are not familiar with more technical devices (such as seniors), so she suggested making the interface simple and easy to understand.'
    ]
  },
  {
    label: '#3: Interviewee: amateur fishing hobbyist / Interview date: September 29, 2026',
    points: [
      'Passionate about fishing and is interested in the concept. He has personal experience on the issue, where he had accidentally caught an endangered species while fishing and had to set it free, though it was already injured and likely had a hard time surviving afterwards.',
      'Interviewee also mentioned that he would prefer to see the camera’s view on the screen, as it would help him see if there is actually any fish in that location.'
    ]
  }
];
