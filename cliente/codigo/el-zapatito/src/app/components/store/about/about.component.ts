import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-page">

      <!-- ── HERO ── -->
      <section class="about-hero">
        <div class="hero-bg-shapes">
          <span class="shape shape-1"></span>
          <span class="shape shape-2"></span>
          <span class="shape shape-3"></span>
        </div>
        <div class="hero-inner">
          <span class="eyebrow">Equipo Zapatin · 2026</span>
          <h1 class="hero-title">Quiénes <em>somos</em></h1>
          <p class="hero-sub">
            Somos un equipo apasionado por el diseño, la tecnología y el calzado.
            Creamos <strong>El Zapatito</strong> para llevar experiencias de compra
            premium a todos, con identidad, estilo y corazón.
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-num">5</span>
              <span class="stat-label">Integrantes</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">100%</span>
              <span class="stat-label">Dedicación</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">2026</span>
              <span class="stat-label">Fundación</span>
            </div>
          </div>
        </div>
        <div class="hero-shoe-visual">
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=900"
            alt="Zapatos El Zapatito"
            class="hero-shoe-img"
          />
          <div class="hero-shoe-glow"></div>
        </div>
      </section>

      <!-- ── MISIÓN & VALORES ── -->
      <section class="values-section">
        <div class="section-tag">Nuestra Filosofía</div>
        <h2 class="section-title">Construido con propósito</h2>
        <div class="values-grid">
          <div class="value-card" *ngFor="let v of values">
            <div class="value-icon">{{ v.icon }}</div>
            <h3>{{ v.title }}</h3>
            <p>{{ v.desc }}</p>
          </div>
        </div>
      </section>

      <!-- ── EQUIPO ── -->
      <section class="team-section">
        <div class="section-tag">Las personas detrás del proyecto</div>
        <h2 class="section-title">Nuestro equipo</h2>
        <div class="team-grid">
          <div class="team-card" *ngFor="let m of team; let i = index" [class]="'card-' + i">
            <div class="card-avatar">
              <img [src]="m.avatar" [alt]="m.name" />
              <div class="avatar-ring"></div>
            </div>
            <div class="card-info">
              <h3 class="member-name">{{ m.name }}</h3>
              <span class="member-role">{{ m.role }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── CTA ── -->
      <section class="cta-section">
        <div class="cta-glow"></div>
        <h2>¿Listo para explorar?</h2>
        <p>Descubre nuestra colección y encuentra el par perfecto para ti.</p>
        <a href="/catalog" class="cta-btn">Ver Catálogo →</a>
      </section>

    </div>
  `,
  styles: [`
    /* ─── PAGE WRAPPER ─── */
    .about-page {
      display: flex;
      flex-direction: column;
      gap: 0;
      overflow-x: hidden;
    }

    /* ─── SHARED SECTION UTILITIES ─── */
    .section-tag {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #888;
      margin-bottom: 1rem;
      padding: 0.4rem 1rem;
      background: #f5f5f5;
      border-radius: 50px;
    }
    
    .section-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      letter-spacing: -1.5px;
      line-height: 1.1;
      margin-bottom: 3rem;
    }

    /* ─── HERO (MODIFICADO PARA CENTRAR) ─── */
    .about-hero {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center; 
      gap: 5rem;              
      padding: 6rem 2rem 5rem; 
      overflow: hidden;
      min-height: 85vh;
      max-width: 1200px;      
      margin: 0 auto;        
      width: 100%;
    }

    .hero-bg-shapes { position: absolute; inset: 0; pointer-events: none; }
    .shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.12;
    }
   
    @keyframes floatShape {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-30px) scale(1.05); }
    }

    .hero-inner {
      position: relative;
      flex: 1;
      z-index: 1;
      max-width: 540px;    
    }
    
    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #fff;
      background: #111;
      padding: 0.4rem 1.2rem;
      border-radius: 50px;
      margin-bottom: 1.5rem;
    }
    .hero-title {
      font-size: clamp(3rem, 6vw, 5.5rem);
      font-weight: 900;
      letter-spacing: -3px;
      line-height: 1;
      margin-bottom: 1.5rem;
      color: #111;
    }
    .hero-title em {
      font-style: normal;
      background: linear-gradient(135deg, #6c63ff, #ff6b6b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-sub {
      font-size: 1.15rem;
      color: #555;
      line-height: 1.8;
      margin-bottom: 3rem;
    }
    .hero-sub strong { color: #111; }

    .hero-stats {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 2rem 2.5rem;
      background: #fafafa;
      border: 1px solid #eee;
      border-radius: 20px;
      width: fit-content;
    }
    .stat-item { text-align: center; }
    .stat-num { display: block; font-size: 2rem; font-weight: 900; letter-spacing: -1px; color: #111; }
    .stat-label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .stat-divider { width: 1px; height: 40px; background: #eee; }

    .hero-shoe-visual {
      position: relative;
      flex: 1;
      max-width: 500px;
      z-index: 1;
    }
    .hero-shoe-img {
      width: 100%;
      border-radius: 24px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.15);
      transform: rotate(-3deg) translateY(-10px);
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .hero-shoe-visual:hover .hero-shoe-img { transform: rotate(0deg) translateY(0); }
    .hero-shoe-glow {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 70%;
      height: 40px;
      background: rgba(108,99,255,0.3);
      filter: blur(20px);
      border-radius: 50%;
    }

    /* ─── VALUES ─── */
    .values-section {
      padding: 7rem 0;
      background: #fafafa;
      margin: 0 -2rem;
      padding-left: 2rem;
      padding-right: 2rem;
    }
    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 2rem;
    }
    .value-card {
      background: #fff;
      border: 1px solid #ebebeb;
      border-radius: 20px;
      padding: 2.5rem 2rem;
      transition: all 0.3s ease;
      cursor: default;
    }
    .value-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      border-color: transparent;
    }
    .value-icon {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      display: block;
    }
    .value-card h3 {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      letter-spacing: -0.5px;
    }
    .value-card p {
      font-size: 0.95rem;
      color: #666;
      line-height: 1.7;
    }

    /* ─── TEAM ─── */
    .team-section {
      padding: 7rem 0;
    }
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2.5rem;
    }
    .team-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      background: #fff;
      border: 1px solid #ebebeb;
      border-radius: 24px;
      overflow: hidden;
      padding-bottom: 2.5rem;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .team-card:hover {
      transform: translateY(-12px);
      box-shadow: 0 30px 60px rgba(0,0,0,0.1);
      border-color: transparent;
    }

    /* Accent color per card */
    .card-0 { --accent: #6c63ff; }
    .card-1 { --accent: #ff6b6b; }
    .card-2 { --accent: #ffd93d; }
    .card-3 { --accent: #4ecdc4; }
    .card-4 { --accent: #ff9f43; }

    .card-avatar {
      position: relative;
      width: 100%;
      height: 240px;
      background: color-mix(in srgb, var(--accent) 12%, #fff);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.75rem;
    }
    .card-avatar img {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      border: 5px solid #fff;
      box-shadow: 0 12px 35px rgba(0,0,0,0.14);
      transition: transform 0.4s ease;
      z-index: 1;
      position: relative;
    }
    .team-card:hover .card-avatar img { transform: scale(1.08); }
    .avatar-ring {
      position: absolute;
      width: 170px;
      height: 170px;
      border-radius: 50%;
      border: 2px dashed var(--accent);
      opacity: 0.6;
      animation: spinRing 12s linear infinite;
    }
    @keyframes spinRing { to { transform: rotate(360deg); } }

    .card-info {
      padding: 0 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.65rem;
    }
    .member-name {
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #111;
    }
    .member-role {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #fff;
      background: var(--accent);
      padding: 0.35rem 1rem;
      border-radius: 50px;
    }

    /* ─── CTA ─── */
    .cta-section {
      position: relative;
      text-align: center;
      padding: 8rem 2rem;
      overflow: hidden;
      background: #fafafa;
    }
    .cta-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 300px;
      background: radial-gradient(ellipse, rgba(108,99,255,0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .cta-section h2 {
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: 900;
      letter-spacing: -2px;
      margin-bottom: 1rem;
      position: relative;
    }
    .cta-section p {
      font-size: 1.15rem;
      color: #666;
      margin-bottom: 3rem;
      position: relative;
    }
    .cta-btn {
      display: inline-block;
      background: #111;
      color: #fff;
      text-decoration: none;
      padding: 1.2rem 3rem;
      border-radius: 14px;
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }
    .cta-btn:hover {
      background: #6c63ff;
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(108,99,255,0.35);
      opacity: 1;
    }

    /* ─── RESPONSIVE ─── */
    @media (max-width: 1100px) {
      .team-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 900px) {
      .about-hero { flex-direction: column; min-height: auto; padding: 4rem 0 3rem; text-align: center; }
      .hero-inner { max-width: 100%; }
      .hero-stats { margin: 0 auto; }
      .hero-shoe-visual { max-width: 100%; }
      .team-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .hero-stats { flex-direction: column; gap: 1rem; }
      .stat-divider { width: 40px; height: 1px; }
      .values-grid { grid-template-columns: 1fr; }
      .team-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AboutComponent {
  values = [
    {
      icon: '👟',
      title: 'Pasión por el calzado',
      desc: 'Seleccionamos cada producto con criterio estético y de calidad. Queremos que cada par que elijas sea una extensión de tu personalidad.'
    },
    {
      icon: '💡',
      title: 'Innovación constante',
      desc: 'Usamos tecnologías modernas para que tu experiencia de compra sea rápida, intuitiva y segura en cualquier dispositivo.'
    },
    {
      icon: '🤝',
      title: 'Trabajo en equipo',
      desc: 'Somos un equipo multidisciplinario que combina diseño, desarrollo y negocio para crear una plataforma integral.'
    },
    {
      icon: '🌟',
      title: 'Excelencia en diseño',
      desc: 'Cada pixel y cada línea de código está pensada para ofrecer una experiencia visual memorable y funcional.'
    }
  ];

  team = [
    {
      name: 'Fatima Peralta',
      role: 'Trabajadora',
      avatar: 'https://i.pravatar.cc/150?img=47'
    },
    {
      name: 'Mundo',
      role: 'Patron',
      avatar: 'https://i.pravatar.cc/150?img=11'
    },
    {
      name: 'Zahid',
      role: 'Trabajador',
      avatar: 'https://i.pravatar.cc/150?img=52'
    },
    {
      name: 'Eleonor Guadalupe',
      role: 'Trabajadora',
      avatar: 'https://i.pravatar.cc/150?img=44'
    },
    {
      name: 'Adán de Jesús',
      role: 'Trabajador',
      avatar: 'https://i.pravatar.cc/150?img=60'
    }
  ];
}
