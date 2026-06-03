// Start overlay and loading sequence
const cursor = document.getElementById('customCursor');

// Initialize DOM references at the top
// const cursor = document.getElementById('customCursor');
const screenBox = document.getElementById('screenBox');
const projectsPaper = document.getElementById('projectsPaper');
const aboutButton = document.getElementById('aboutButton');
const overlay = document.getElementById('overlay');
const aboutContainer = document.getElementById('aboutContainer');
const closeButton = document.getElementById('closeButton');
const projectsUrl = "CV.html";  // Changed from external URL to local CV.html
let typingText; // Will be initialized when creating the about frame

// Add references for audio elements
const backgroundAudio = document.getElementById('backgroundAudio');
const soundControl = document.getElementById('soundControl');
const soundIcon = soundControl.querySelector('.sound-icon');

// Audio control functionality
soundControl.addEventListener('click', () => {
  if (backgroundAudio.paused) {
    backgroundAudio.play().then(() => {
      soundIcon.classList.remove('fa-volume-mute', 'sound-off');
      soundIcon.classList.add('fa-volume-up', 'sound-on');
    }).catch(error => {
      console.log('Audio playback failed:', error);
    });
  } else {
    backgroundAudio.pause();
    soundIcon.classList.remove('fa-volume-up', 'sound-on');
    soundIcon.classList.add('fa-volume-mute', 'sound-off');
  }
});

// Mouse tracking for cursor
document.addEventListener('mousemove', (e) => {
  if (cursor) {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    cursor.style.opacity = '1';
    cursor.style.pointerEvents = 'none'; // Ensure cursor doesn't block clicks
  }
});

document.addEventListener('mouseleave', () => {
  if (cursor) cursor.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
  if (cursor) cursor.style.opacity = '1';
});

// Ensure cursor is visible after the start overlay is dismissed
document.addEventListener('DOMContentLoaded', () => {
  const startOverlay = document.getElementById('startOverlay');
  if (startOverlay) {
    startOverlay.addEventListener('click', () => {
      setTimeout(() => {
        if (cursor) {
          cursor.style.visibility = 'visible';
          cursor.style.opacity = '1';
        }
      }, 500);
    });
  }
});

function makeDraggable(el) {
  let offsetX, offsetY, isDragging = false;
  let startTime = 0;
  let initialRotation = -5; // Starting rotation
  let rotationDelta = 0;
  let startX, startY; // Track starting position
  let hasMoved = false; // Track if element has moved
  
  el.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    isDragging = true;
    startTime = Date.now();

    startX = e.clientX;
    startY = e.clientY;
    hasMoved = false;

    // Freeze current visual position so CSS transform/% values don't cause a jump
    const rect = el.getBoundingClientRect();
    el.style.transition = 'none';
    el.style.left = rect.left + 'px';
    el.style.top = rect.top + 'px';

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    if (el.id === 'projectsPaper') {
      el.classList.add('dragging');
      initialRotation = getComputedRotation(el) || -5;
    } else {
      el.style.transform = 'none';
    }

    el.style.zIndex = 1000;
    cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      // Check if we've moved more than 5px in any direction
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - startX, 2) + 
        Math.pow(e.clientY - startY, 2)
      );
      
      if (moveDistance > 5) {
        hasMoved = true;
      }
      
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
      
      // Special effects for paper plane when dragging
      if (el.id === 'projectsPaper') {
        // Calculate movement speed for rotation effect
        const dx = e.movementX;
        const dy = e.movementY;
        const speed = Math.sqrt(dx*dx + dy*dy);
        
        // Add slight rotation based on horizontal movement
        rotationDelta = dx * 0.2;
        const newRotation = initialRotation + rotationDelta;
        
        // Limit rotation range
        const boundedRotation = Math.max(-25, Math.min(25, newRotation));
        
        // Apply rotation and subtle scaling based on speed
        el.style.transform = `rotate(${boundedRotation}deg) scale(${1 + speed*0.001})`;
      }
    }
  });
  
  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;

    const clickDuration = Date.now() - startTime;

    if (el.id === 'projectsPaper') {
      el.classList.remove('dragging');
      el.style.transform = 'rotate(5deg) translateY(-10px)';
      if (clickDuration < 200 && !hasMoved) {
        openProjects(e);
      }
    } else {
      el.style.transition = '';
    }

    isDragging = false;
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });
  
  // Only block the click if the user actually dragged — lets buttons/links inside work normally
  el.addEventListener('click', (e) => {
    if (hasMoved) {
      e.stopPropagation();
      e.preventDefault();
    }
  });

  // ── Touch support ──────────────────────────────────────
  function getTouch(e) { return e.touches[0] || e.changedTouches[0]; }
  let positionFrozen = false;

  // passive:true so we don't block synthesised click events on child buttons/links
  el.addEventListener('touchstart', (e) => {
    const t = getTouch(e);
    isDragging = true;
    positionFrozen = false;
    startTime = Date.now();
    startX = t.clientX; startY = t.clientY;
    hasMoved = false;
    el.style.zIndex = 1000;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const t = getTouch(e);
    const dist = Math.hypot(t.clientX - startX, t.clientY - startY);

    if (dist > 8) {
      // Freeze position on first genuine drag movement
      if (!positionFrozen) {
        const rect = el.getBoundingClientRect();
        el.style.transition = 'none';
        el.style.left = rect.left + 'px';
        el.style.top  = rect.top  + 'px';
        offsetX = t.clientX - rect.left;
        offsetY = t.clientY - rect.top;
        if (el.id === 'projectsPaper') {
          el.classList.add('dragging');
          initialRotation = getComputedRotation(el) || -5;
        } else {
          el.style.transform = 'none';
        }
        positionFrozen = true;
      }
      hasMoved = true;
      e.preventDefault(); // prevent page scroll only while dragging
      el.style.left = `${t.clientX - offsetX}px`;
      el.style.top  = `${t.clientY - offsetY}px`;

      if (el.id === 'projectsPaper') {
        const dx = t.clientX - startX;
        const bounded = Math.max(-25, Math.min(25, initialRotation + dx * 0.15));
        el.style.transform = `rotate(${bounded}deg)`;
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const clickDuration = Date.now() - startTime;

    if (el.id === 'projectsPaper') {
      el.classList.remove('dragging');
      el.style.transform = 'rotate(5deg) translateY(-10px)';
      if (clickDuration < 300 && !hasMoved) openProjects(e);
    } else if (el.classList.contains('notebook') && !hasMoved && clickDuration < 300) {
      window.location.href = 'Projects.html';
    } else {
      el.style.transition = '';
    }
    isDragging = false;
  });
}

// Helper function to get current rotation
function getComputedRotation(el) {
  const style = window.getComputedStyle(el);
  const matrix = new DOMMatrix(style.transform);
  return Math.round(Math.atan2(matrix.b, matrix.a) * (180 / Math.PI));
}

// Make an element draggable by a specific handle (used for iPod)
function makeDraggableElement(el, handle) {
  handle = handle || el;
  let isDragging = false;
  let offsetX, offsetY;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    el.style.zIndex = 9999;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener('mouseup', () => { isDragging = false; });

  handle.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    isDragging = true;
    const rect = el.getBoundingClientRect();
    offsetX = t.clientX - rect.left;
    offsetY = t.clientY - rect.top;
    el.style.zIndex = 9999;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const t = e.touches[0];
    el.style.left = `${t.clientX - offsetX}px`;
    el.style.top  = `${t.clientY - offsetY}px`;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', () => { isDragging = false; });
}

function saveAudioToStorage() {
  try {
    if (!backgroundAudio || !backgroundAudio.src) return;
    localStorage.setItem('audioState', JSON.stringify({
      src: backgroundAudio.src,
      currentTime: backgroundAudio.currentTime,
      isPlaying: !backgroundAudio.paused,
      volume: backgroundAudio.volume
    }));
  } catch(e) {}
}

window.addEventListener('beforeunload', saveAudioToStorage);

function openProjects(e) {
  e.preventDefault();
  saveAudioToStorage();
  const plane = document.getElementById('projectsPaper');
  
  // Play paper plane whoosh sound (optional)
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fast-small-sweep-transition-166.mp3');
  audio.volume = 0.3;
  audio.play().catch(err => console.log('Audio failed to play:', err));
  
  // Redirect after animation to CV.html
  setTimeout(() => {
    window.location.href = projectsUrl;
  }, 1500);
}

window.onload = () => {
  document.querySelectorAll('.screen, .notebook, .mug').forEach(makeDraggable);
  
  // Add click handler for notebook to open Projects.html
  const notebook = document.querySelector('.notebook');
  if (notebook) {
    notebook.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = 'Projects.html';
    });
    notebook.style.cursor = 'pointer';
  }
  
  // Add click functionality to email tag
  const emailTag = document.querySelector('.email-tag');
  if (emailTag) {
    // Remove the no-pointer-events style
    emailTag.style.pointerEvents = 'auto';
    
    // Add cursor style
    emailTag.style.cursor = 'pointer';
    
    // Add click event handler to open email client
    emailTag.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.open('mailto:gyandeep.das@research.iiit.ac.in', '_blank');
    });
  }
  
  // Handle iframe load/error events
  const iframe = document.getElementById('previewIframe');
  const errorFallback = document.getElementById('errorFallback');
  
  // Hide error fallback by default to show iframe content
  errorFallback.style.opacity = '0';
  
  iframe.addEventListener('load', function() {
    try {
      iframe.contentWindow.document.body;
      errorFallback.style.opacity = '0';
    } catch (error) {
      errorFallback.style.opacity = '1';
    }
  });

  iframe.addEventListener('error', function() {
    errorFallback.style.opacity = '1';
  });
}

// About Me functionality with zoom effect

// Simplified content for ME.md
const shortContent = `# About Me

I'm Gyandeep, you can call me GD. I'm from Guwahati, Assam. I'm doing my Bachelors in Computer Science from IIIT Hyderabad. I'm a huge fan of FC Barcelona and Manchester City, I follow F1 too, heil Mercedes!!!!
I love playing guitar and Singing. Right now, I'm going through a character development phase, I guess you'll know it if you meet me personally.`;

const fullContent = `# About Gyandeep

Hi there! I'm a creative developer passionate about building interactive web experiences.

## My Journey
I started coding when I was 14 years old, beginning with HTML and CSS. Fast forward to today, I've 
worked on numerous projects that push the boundaries of what's possible on the web.

## Skills & Technologies
- JavaScript (React, Vue, Three.js)
- Creative coding with WebGL and Canvas
- Interactive animations and experiences
- UX/UI Design and prototyping

## Personal
When I'm not coding, you'll find me taking photos, playing video games, or exploring new places around the world.

Feel free to reach out and connect!`;

// Type writer effect
function typeWriter(text, element, speed = 30, onComplete = null) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (onComplete) {
      onComplete();
    }
  }
  
  type();
}

// Modify addTellMeMoreButton to link to external page
function addTellMeMoreButton() {
  const button = document.createElement('button');
  button.className = 'tell-me-more';
  button.textContent = 'Tell me more';
  
  // Set up the styling for a link-type button
  button.style.position = 'relative';
  button.style.display = 'inline-flex';
  button.style.alignItems = 'center';
  button.style.gap = '8px';
  
  // Add an icon to indicate external link
  const linkIcon = document.createElement('i');
  linkIcon.className = 'fas fa-external-link-alt';
  linkIcon.style.fontSize = '0.8em';
  
  // Add the icon to the button
  button.appendChild(linkIcon);
  
  button.addEventListener('click', () => {
    // Direct to external about me webpage
    window.open('https://gyandeep-portfolio.vercel.app/about', '_blank');
  });
  
  typingText.appendChild(document.createElement('br'));
  typingText.appendChild(document.createElement('br'));
  typingText.appendChild(button);
  
  // Add a small note under the button to indicate external link
  const noteText = document.createElement('div');
  noteText.style.fontSize = '0.7em';
  noteText.style.opacity = '0.7';
  noteText.style.marginTop = '5px';
  noteText.textContent = '(opens in a new tab)';
  typingText.appendChild(noteText);
}

// Create about me text frame - centered
function createAboutFrame() {
  const frameWidth = 350;
  const frameHeight = 300;
  const left = "10%";
  const top = "10%";
  
  // Create the ME.md frame using createDraggableFrame so it is draggable
  const aboutFrame = createDraggableFrame('ME.md', '', `${frameWidth}px`, `${frameHeight}px`, left, top);
  
  // Make header more visually distinct and explicitly set up for dragging
  const header = aboutFrame.querySelector('.frame-header');
  header.style.cursor = 'move';
  header.style.background = '#1e1eff'; // Make the header more visible
  header.style.position = 'relative'; // Ensure positioning context
  header.style.zIndex = '10'; // Make sure it's above other elements

  // Add a visual cue to show it's draggable
  const dragHandle = document.createElement('span');
  dragHandle.innerHTML = '&#x2756; Drag me &#x2756;'; // Unicode handle symbol
  dragHandle.style.fontSize = '12px';
  dragHandle.style.marginLeft = '10px';
  header.appendChild(dragHandle);
  
  // Add a close button to ME.md frame
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.marginLeft = 'auto';
  closeBtn.style.background = "red";
  closeBtn.style.color = "white";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.addEventListener('click', () => { 
    // Instead of removing, just hide it
    aboutFrame.style.display = 'none';
  });
  header.appendChild(closeBtn);
  
  // Setup extra draggability directly on this element
  let isDragging = false;
  let startX, startY;
  
  header.addEventListener('mousedown', function(e) {
    e.stopPropagation(); // Prevent event bubbling
    isDragging = true;
    startX = e.clientX - aboutFrame.offsetLeft;
    startY = e.clientY - aboutFrame.offsetTop;
    aboutFrame.style.zIndex = 9999; // Bring to front when dragging
  });
  
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    aboutFrame.style.left = (e.clientX - startX) + 'px';
    aboutFrame.style.top = (e.clientY - startY) + 'px';
  });
  
  document.addEventListener('mouseup', function() {
    isDragging = false;
  });
  
  const frameContent = aboutFrame.querySelector('.frame-content');
  
  // Add a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = frameContent.clientWidth;
  canvas.height = frameContent.clientHeight;
  canvas.className = 'about-canvas';
  frameContent.appendChild(canvas);
  
  // Create typing text element above canvas
  const typingTextElement = document.createElement('div');
  typingTextElement.className = 'typing-text';
  typingTextElement.id = 'typingText';
  typingTextElement.style.position = 'relative';
  typingTextElement.style.zIndex = 1;
  frameContent.appendChild(typingTextElement);
  
  // Start the painting effect on the canvas
  paintCanvas(canvas);
  
  return typingTextElement;
}

// A function to simulate a brush painting effect on the canvas
function paintCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let progress = 0;
  
  function draw() {
    progress += 0.01;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw several random strokes
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineWidth = Math.random() * 3 + 1;
      // Stroke opacity grows gradually
      ctx.strokeStyle = `rgba(0,0,0,${Math.min(progress, 1) * 0.3})`;
      ctx.stroke();
    }
    if (progress < 1) {
      requestAnimationFrame(draw);
    }
  }
  draw();
}

// Create polaroid photo frames - arranged around center
function createPolaroids() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;
  
  // Use a smaller radius (15% of smallest dimension) to keep frames inside
  const radius = Math.min(screenWidth, screenHeight) * 0.15;
  
  photosData.forEach((photo, index) => {
    // Calculate position in a circular arrangement
    const angle = (index / photosData.length) * Math.PI * 2; // Distribute evenly in a circle
    
    const offsetX1 = Math.cos(angle) * radius;
    const offsetY1 = Math.sin(angle) * radius;
    
    // Position relative to center
    const left = `${centerX + offsetX - 90}px`; // 90px is half the width of polaroid
    const top = `${centerY + offsetY - 110}px`; // 110px is half the height of polaroid
    
    const polaroid = document.createElement('div');
    polaroid.className = 'polaroid-frame';
    polaroid.style.setProperty('--rotation', photo.rotation);
    polaroid.style.left = left;
    polaroid.style.top = top;
    polaroid.setAttribute('data-caption', photo.caption);
    
    const img = document.createElement('img');
    img.className = 'polaroid-img';
    img.src = photo.src;
    img.alt = photo.caption;
    
    polaroid.appendChild(img);
    aboutContainer.appendChild(polaroid);
    
    // Make draggable
    let isDragging = false;
    let offsetX, offsetY;
    
    polaroid.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - polaroid.getBoundingClientRect().left;
      offsetY = e.clientY - polaroid.getBoundingClientRect().top;
      polaroid.style.zIndex = 200;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      polaroid.style.left = `${e.clientX - offsetX}px`;
      polaroid.style.top = `${e.clientY - offsetY}px`;
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  });
}

// Create color palette and info - centered
function createColorPalette() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const frameWidth = 400;
  const frameHeight = 400;
  
  // Position to the right of the ME.md frame
  const left = `${(screenWidth - frameWidth) / 2 + 200}px`;
  const top = `${(screenHeight - frameHeight) / 2}px`;
  
  const frame = createDraggableFrame('Color Palette', '', `${frameWidth}px`, `${frameHeight}px`, left, top);
  const frameContent = frame.querySelector('.frame-content');
  
  // Create color palette container
  const palette = document.createElement('div');
  palette.className = 'color-palette';
  
  const colors = [
    { name: 'red', hex: '#ff5252' },
    { name: 'blue', hex: '#4285f4' },
    { name: 'green', hex: '#0f9d58' },
    { name: 'yellow', hex: '#ffca28' },
    { name: 'purple', hex: '#9c27b0' },
    { name: 'orange', hex: '#ff7043' }
  ];
  
  colors.forEach(color => {
    const colorBlock = document.createElement('div');
    colorBlock.className = 'color-block';
    colorBlock.style.backgroundColor = color.hex;
    colorBlock.dataset.color = color.name;
    palette.appendChild(colorBlock);
    
    colorBlock.addEventListener('click', () => {
      // Clear previous selections and reset info blocks
      document.querySelectorAll('.color-block').forEach(block => {
        block.classList.remove('clicked');
      });
      document.querySelectorAll('.info-block').forEach(block => {
        block.innerHTML = '';
        block.classList.remove('active', 'fade-in');
      });
      
      // Mark current block as clicked
      colorBlock.classList.add('clicked');
      
      // Show corresponding info statically and add fade-in class for effect
      const infoBlock = document.querySelector(`.info-block[data-color="${color.name}"]`);
      infoBlock.innerHTML = colorInfoContent[color.name];
      infoBlock.classList.add('active');
      setTimeout(() => {
        infoBlock.classList.add('fade-in');
      }, 10);
    });
  });
  
  frameContent.appendChild(palette);
  
  // Create info blocks (initially empty)
  Object.entries(colorInfoContent).forEach(([color, content]) => {
    const infoBlock = document.createElement('div');
    infoBlock.className = 'info-block';
    infoBlock.dataset.color = color;
    infoBlock.innerHTML = ''; // Will be set on click
    frameContent.appendChild(infoBlock);
  });
}

// Simplified content for ME.md
const shortContent1 = `# About Me

I'm Gyandeep, you can call me GD. I'm from Guwahati, Assam. I'm doing my Bachelors in Computer Science from IIIT Hyderabad. I'm a huge fan of FC Barcelona and Manchester City, I follow F1 too, heil Mercedes!!!!
I love playing guitar and Singing. Right now, I'm going through a character development phase, I guess you'll know it if you meet me personally.`;

const fullContent1 = `# About Gyandeep

Hi there! I'm a creative developer passionate about building interactive web experiences.

## My Journey
I started coding when I was 14 years old, beginning with HTML and CSS. Fast forward to today, I've 
worked on numerous projects that push the boundaries of what's possible on the web.

## Skills & Technologies
- JavaScript (React, Vue, Three.js)
- Creative coding with WebGL and Canvas
- Interactive animations and experiences
- UX/UI Design and prototyping

## Personal
When I'm not coding, you'll find me taking photos, playing video games, or exploring new places around the world.

Feel free to reach out and connect!`;

// Color palette info content
const colorInfoContent = {
  red: "<h3>My Passion</h3><p>I have a burning passion for creative coding and interactive experiences. I love pushing the boundaries of what's possible on the web!</p>",
  blue: "<h3>Technical Skills</h3><p>Proficient in JavaScript, React, Three.js, and WebGL. I create immersive web experiences that blend art and technology.</p>",
  green: "<h3>Education</h3><p>Bachelor's in Computer Science with a focus on Human-Computer Interaction. Constantly learning new technologies and approaches.</p>",
  yellow: "<h3>Hobbies</h3><p>When I'm not coding, I enjoy photography, playing guitar, and exploring new hiking trails. I'm also an avid board game collector!</p>",
  purple: "<h3>Work Experience</h3><p>5+ years creating interactive websites and digital experiences for clients across various industries, from startups to major brands.</p>",
  orange: "<h3>Future Goals</h3><p>I aim to create more accessible digital experiences and continue exploring the intersection of art, design, and technology.</p>"
};

// Photo captions and rotations
const photosData = [
  { src: "path/to/photo1.jpg", caption: "Hiking with friends", rotation: "-5deg", left: "15%", top: "20%" },
  { src: "path/to/photo2.jpg", caption: "Coding meetup", rotation: "3deg", left: "75%", top: "30%" },
  { src: "path/to/photo3.jpg", caption: "Weekend adventure", rotation: "-2deg", left: "60%", top: "60%" }
];

// Setup draggable functionality
function makeDraggableFrame(el) {
  const header = el.querySelector('.frame-header');
  let isDragging = false;
  let offsetX, offsetY;
  
  if (!header) return;
  
  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;
    el.classList.add('active');
    el.style.zIndex = 200;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    el.classList.remove('active');
  });
  
  // Bring to front on click
  el.addEventListener('mousedown', () => {
    document.querySelectorAll('.draggable-frame').forEach(frame => {
      frame.style.zIndex = 100;
    });
    el.style.zIndex = 200;
  });
}

aboutButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  saveAudioToStorage();
  window.location.href = 'AboutMe.html';
});

// No need to remove closeAboutSection since it won't be used, but keeping for reference
// Just redirecting to main page on close
closeButton.addEventListener('click', () => {
  window.location.href = 'index.html';
});
overlay.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Add references for iPod elements
const musicButton = document.getElementById('musicButton');
let ipodContainer = null;

// Define all available songs
const allSongs = [
  { title: "Hard Times", artist: "Paramore", audio: "audio/background-music.mp3", video: "images/lifeVideo.mp4" },
  // { title: "Classic Rock", artist: "Rock Legends", audio: "audio/classicrock.mp3", video: "images/lifeVideo.mp4" },
  // { title: "Metal", artist: "Heavy Hitters", audio: "audio/metal.mp3", video: "images/lifeVideo.mp4" },
  // { title: "Rock Ballads", artist: "Power Anthems", audio: "audio/ballads.mp3", video: "images/lifeVideo.mp4" },
  // { title: "Jazz Vibes", artist: "Smooth Jazz", audio: "audio/jazz.mp3", video: "images/lifeVideo.mp4" },
  { title: "NOKIA", artist: "Drake", audio: "audio/NOKIA.mp3", video: "images/lifeVideo.mp4" },
  { title: "Feel Good Inc.", artist: "Gorillaz", audio: "audio/feelgoodinc.mp3", video: "images/lifeVideo.mp4" },
  { title: "Lost", artist: "Frank Ocean", audio: "audio/Lost.mp3", video: "images/lifeVideo.mp4" }
];

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Shuffle songs on page load
const shuffledSongs = shuffleArray([...allSongs]);

// Create and control iPod interface
function createIPodInterface() {
  // Create iPod container if it doesn't exist
  if (!ipodContainer) {
    ipodContainer = document.createElement('div');
    ipodContainer.className = 'ipod-container';
    ipodContainer.innerHTML = `
      <div class="ipod-header">
        <span>🎵 My Music</span>
        <button class="ipod-close">×</button>
      </div>
      <div class="ipod-screen">
        <video src="images/lifeVideo.mp4" id="lifeVideo" muted loop></video>
      </div>
      <div class="ipod-progress-bar" id="ipodProgressBar">
        <div class="ipod-progress-fill" id="ipodProgressFill"></div>
      </div>
      <div class="track-list">
        <div class="current-track">
          <div class="track-info">
            <div class="song-title" id="currentSongTitle">Background Music</div>
            <div class="song-artist" id="currentArtist">My Tracks</div>
          </div>
        </div>
        <div class="track-controls">
          <button id="prevTrackBtn">⏮ PREV</button>
          <div id="trackCounter">Track 1/${shuffledSongs.length}</div>
          <button id="nextTrackBtn">NEXT ⏭</button>
        </div>
      </div>
      <div class="ipod-controls">
        <div class="ipod-wheel">
          <div class="wheel-center" id="playPauseButton"></div>
          <div class="wheel-top control" id="volumeUpButton" title="Volume Up">
            <span class="control-icon">VOL+</span>
          </div>
          <div class="wheel-right control" id="nextButton" title="Next">
            <span class="control-icon">▶▶</span>
          </div>
          <div class="wheel-bottom control" id="volumeDownButton" title="Volume Down">
            <span class="control-icon">VOL-</span>
          </div>
          <div class="wheel-left control" id="prevButton" title="Previous">
            <span class="control-icon">◀◀</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(ipodContainer);
    
    let currentTrackIndex = 0;
    
    // Instead of creating new audio, use background audio
    const ipodAudio = backgroundAudio;
    ipodAudio.loop = true;
    
    // Track switching functionality - now controls background music
    function updateTrackDisplay() {
      const track = shuffledSongs[currentTrackIndex];
      
      // Update text displays
      document.getElementById('currentSongTitle').textContent = track.title;
      document.getElementById('currentArtist').textContent = track.artist;
      document.getElementById('trackCounter').textContent = `Track ${currentTrackIndex + 1}/${shuffledSongs.length}`;
      
      // Update audio and video sources
      ipodAudio.src = track.audio;
      document.getElementById('lifeVideo').src = track.video;
      
      // Start playing the new track
      ipodAudio.play().catch(e => console.log("Audio playback failed:", e));
      document.getElementById('lifeVideo').play().catch(e => console.log("Video playback failed:", e));
      
      // Update play button state
      document.getElementById('playPauseButton').classList.add('playing');
      
      // Update sound icon
      soundIcon.classList.remove('sound-off');
      soundIcon.classList.add('sound-on');
    }
    
    function nextTrack() {
      currentTrackIndex = (currentTrackIndex + 1) % shuffledSongs.length;
      updateTrackDisplay();
    }
    
    function prevTrack() {
      currentTrackIndex = (currentTrackIndex - 1 + shuffledSongs.length) % shuffledSongs.length;
      updateTrackDisplay();
    }
    
    // Setup close button functionality
    const closeButton = ipodContainer.querySelector('.ipod-close');
    closeButton.addEventListener('click', () => {
      ipodContainer.classList.remove('active');
      if (document.getElementById('lifeVideo')) document.getElementById('lifeVideo').pause();
    });
    
    // Setup track control buttons
    document.getElementById('nextTrackBtn').addEventListener('click', nextTrack);
    document.getElementById('prevTrackBtn').addEventListener('click', prevTrack);
    
    // Setup wheel controls - now affects background music
    const playPauseButton = document.getElementById('playPauseButton');
    const volumeUpButton = document.getElementById('volumeUpButton');
    const volumeDownButton = document.getElementById('volumeDownButton');
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');
    
    // Center button - play/pause
    playPauseButton.addEventListener('click', () => {
      if (ipodAudio.paused) {
        ipodAudio.play();
        document.getElementById('lifeVideo').play();
        playPauseButton.classList.add('playing');
        soundIcon.classList.remove('sound-off');
        soundIcon.classList.add('sound-on');
      } else {
        ipodAudio.pause();
        document.getElementById('lifeVideo').pause();
        playPauseButton.classList.remove('playing');
        soundIcon.classList.remove('sound-on');
        soundIcon.classList.add('sound-off');
      }
    });
    
    // Volume controls
    volumeUpButton.addEventListener('click', () => {
      ipodAudio.volume = Math.min(1, ipodAudio.volume + 0.1);
      volumeUpButton.classList.add('active');
      setTimeout(() => volumeUpButton.classList.remove('active'), 200);
      
      // Show volume indicator
      showVolumeIndicator(ipodAudio.volume);
    });
    
    volumeDownButton.addEventListener('click', () => {
      ipodAudio.volume = Math.max(0, ipodAudio.volume - 0.1);
      volumeDownButton.classList.add('active');
      setTimeout(() => volumeDownButton.classList.remove('active'), 200);
      
      // Show volume indicator
      showVolumeIndicator(ipodAudio.volume);
    });
    
    // Track navigation
    nextButton.addEventListener('click', () => {
      nextTrack();
      nextButton.classList.add('active');
      setTimeout(() => nextButton.classList.remove('active'), 200);
    });
    
    prevButton.addEventListener('click', () => {
      prevTrack();
      prevButton.classList.add('active');
      setTimeout(() => prevButton.classList.remove('active'), 200);
    });
    
    // Progress bar — update and seek
    const progressBar = document.getElementById('ipodProgressBar');
    progressBar.addEventListener('click', (e) => {
      if (!ipodAudio.duration) return;
      const rect = progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      ipodAudio.currentTime = pct * ipodAudio.duration;
    });

    function updateProgressBar() {
      const fill = document.getElementById('ipodProgressFill');
      if (fill && ipodAudio.duration) {
        const pct = (ipodAudio.currentTime / ipodAudio.duration) * 100;
        fill.style.transition = 'none';
        fill.style.width = pct + '%';
      }
      requestAnimationFrame(updateProgressBar);
    }
    requestAnimationFrame(updateProgressBar);

    // Setup direct drag handling
    const ipodHeader = ipodContainer.querySelector('.ipod-header');
    makeDraggableElement(ipodContainer, ipodHeader);
    
    // Create volume indicator if not exists
    if (!document.getElementById('ipodVolumeIndicator')) {
      const volumeIndicator = document.createElement('div');
      volumeIndicator.id = 'ipodVolumeIndicator';
      volumeIndicator.className = 'volume-indicator';
      volumeIndicator.innerHTML = '<div class="volume-level" id="volumeLevel"></div>';
      ipodContainer.appendChild(volumeIndicator);
    }
    
    // Function to show volume level
    function showVolumeIndicator(volume) {
      const volumeIndicator = document.getElementById('ipodVolumeIndicator');
      const volumeLevel = document.getElementById('volumeLevel');
      
      volumeLevel.style.width = `${volume * 100}%`;
      volumeIndicator.classList.add('visible');

      // Hide after a delay
      setTimeout(() => {
        volumeIndicator.classList.remove('visible');
      }, 1500);
    }

    // Setup background music & video — only on first creation so track position is preserved
    const lifeVideo = document.getElementById('lifeVideo');
    if (backgroundAudio && lifeVideo) {
      backgroundAudio.volume = 0.5;
      lifeVideo.style.width = '100%';
      lifeVideo.style.height = '100%';
      lifeVideo.style.objectFit = 'cover';
      const firstTrack = shuffledSongs[0];
      document.getElementById('currentSongTitle').textContent = firstTrack.title;
      document.getElementById('currentArtist').textContent = firstTrack.artist;
      document.getElementById('trackCounter').textContent = `Track 1/${shuffledSongs.length}`;
      backgroundAudio.src = firstTrack.audio;
      lifeVideo.src = firstTrack.video;
      backgroundAudio.play().catch(err => console.log('Audio playback failed:', err));
      lifeVideo.play().catch(err => console.log('Video playback failed:', err));
      document.getElementById('playPauseButton').classList.add('playing');
      soundIcon.classList.remove('sound-off');
      soundIcon.classList.add('sound-on');
    }

    // Add keyboard controls once
    addIPodKeyboardControls();
  }

  // Show iPod and position it
  ipodContainer.classList.add('active');
  positionIPodInViewport();
}

// Simple, robust function to position iPod where it's fully visible
function positionIPodInViewport() {
  // Reset any transform or margin
  ipodContainer.style.transform = 'none';
  ipodContainer.style.margin = '0';
  ipodContainer.style.position = 'fixed';
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Position at bottom right
  const top = Math.floor(viewportHeight * 0.6) - 150; 
  const left = Math.floor(viewportWidth * 0.75) - 120;
  
  // Apply position
  ipodContainer.style.top = `${Math.max(10, top)}px`;
  ipodContainer.style.left = `${Math.max(10, left)}px`;
}

// Add keyboard controls for iPod
function addIPodKeyboardControls() {
  document.addEventListener('keydown', (e) => {
    // Only respond if iPod is visible
    if (!ipodContainer.classList.contains('active')) return;
    
    switch(e.key) {
      case ' ': // Space - play/pause
        document.getElementById('playPauseButton').click();
        e.preventDefault();
        break;
      case 'ArrowUp': // Volume up
        document.getElementById('volumeUpButton').click();
        e.preventDefault();
        break;
      case 'ArrowDown': // Volume down
        document.getElementById('volumeDownButton').click();
        e.preventDefault();
        break;
      case 'ArrowRight': // Next track
        document.getElementById('nextButton').click();
        e.preventDefault();
        break;
      case 'ArrowLeft': // Previous track
        document.getElementById('prevButton').click();
        e.preventDefault();
        break;
    }
  });
}

// Music button click event - now it will control the background music
musicButton.addEventListener('click', createIPodInterface);


// Wait for the DOM to be ready - Autostart the experience without needing a click
document.addEventListener('DOMContentLoaded', () => {
  const loadingAnimation = document.getElementById('loadingAnimation');
  const backgroundAudio = document.getElementById('backgroundAudio');
  
  // Disable scrolling initially
  document.body.style.overflow = 'hidden';
  
  // Show loading animation
  loadingAnimation.style.visibility = 'visible';
  loadingAnimation.style.opacity = '1';
  
  // Function to start the experience automatically
  function startExperience() {
    // Enable scrolling
    document.body.style.overflow = '';
    
    // Check if we're on the About Me page - don't autoplay music there
    const isAboutMePage = window.location.pathname.includes('AboutMe.html');
    
    // Initialize background music (auto-play) only if not on About Me page
    if (backgroundAudio && !isAboutMePage) {
      // Set the initial shuffled song
      backgroundAudio.src = shuffledSongs[0].audio;
      
      backgroundAudio.play().catch(error => {
        console.log('Audio playback failed:', error);
        // Update sound icon to reflect the actual state
        const soundIcon = document.querySelector('.sound-icon');
        if (soundIcon) {
          soundIcon.classList.remove('fa-volume-up', 'sound-on');
          soundIcon.classList.add('fa-volume-mute', 'sound-off');
        }
      });
    }
  }
  
  // Hide the loading animation after a delay (just one cycle of the GIF)
  const gifDuration = 1500; // Reduced from 3000ms to 1500ms for one cycle
  setTimeout(() => {
    loadingAnimation.style.opacity = '0';
    setTimeout(() => {
      loadingAnimation.style.display = 'none';
      // Make cursor visible after animation finishes
      if (cursor) {
        cursor.style.visibility = 'visible';
        cursor.style.opacity = '1';
      }
      // Start the experience after hiding loading animation
      startExperience();
    }, 500);
  }, gifDuration);
});


// Helper function to get current song index
function getCurrentSongIndex() {
  const currentSrc = backgroundAudio.src;
  for (let i = 0; i < shuffledSongs.length; i++) {
    if (currentSrc.includes(shuffledSongs[i].audio)) {
      return i;
    }
  }
  return 0;
}

