import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Icon from '../components/icons/Icon'
import logo from '../assets/logo.svg'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
}

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

const LandingPage = () => {
  const { t } = useTranslation()
  const [billingCycle, setBillingCycle] = useState('annual')

  const features = [
    { icon: 'shield', title: 'Deteccion de Amenazas', desc: 'IA avanzada que identifica y neutraliza amenazas en milisegundos antes de que impacten tu infraestructura.' },
    { icon: 'activity', title: 'Monitoreo 24/7', desc: 'Supervision continua de todos tus servidores, redes y endpoints con alertas en tiempo real.' },
    { icon: 'bar-chart', title: 'KPIs y Analytics', desc: 'Dashboards interactivos con metricas clave de rendimiento, SLAs y reportes automatizados.' },
    { icon: 'users', title: 'Gestion de Equipos', desc: 'Control de acceso basado en roles (RBAC) con auditoria completa de cada accion.' },
    { icon: 'lock', title: 'Cumplimiento', desc: 'SOC 2, ISO 27001, GDPR. Genera reportes de cumplimiento con un clic.' },
    { icon: 'zap', title: 'Respuesta Automatica', desc: 'Playbooks automatizados que ejecutan acciones correctivas sin intervencion humana.' },
  ]

  const steps = [
    { num: '01', title: 'Registra tu Organizacion', desc: 'Crea tu cuenta empresarial en menos de 2 minutos.' },
    { num: '02', title: 'Instala el Agente', desc: 'Un comando en tu servidor y listo. Compatible con Linux, Docker, K8s.' },
    { num: '03', title: 'Monitorea en Tiempo Real', desc: 'Tu dashboard se activa inmediatamente con datos en vivo.' },
  ]

  const plans = [
    {
      name: 'Starter',
      price: '0',
      period: '/mes',
      desc: 'Para equipos pequenos que inician',
      features: ['5 servidores', '1 usuario', 'Dashboard basico', 'Alertas email', 'Retencion 7 dias'],
      cta: 'Comenzar Gratis',
      highlight: false,
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? '49' : '29',
      period: '/mes',
      annualTotal: '348',
      desc: 'Para equipos en crecimiento',
      features: ['50 servidores', '10 usuarios', 'Dashboard completo', 'Alertas multi-canal', 'Retencion 90 dias', 'API access', 'Roles RBAC'],
      cta: 'Iniciar Prueba Gratis',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'Para grandes organizaciones',
      features: ['Servidores ilimitados', 'Usuarios ilimitados', 'SSO / SAML', 'SLA 99.99%', 'Retencion 1 ano', 'Soporte dedicado', 'On-premise disponible', 'Compliance reports'],
      cta: 'Contactar Ventas',
      highlight: false,
    },
  ]




  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-base)' }}>
      {/* ========== NAVBAR ========== */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain pointer-events-none" />
            <span className="font-bold text-sm tracking-tight text-text-primary">
              Hawk<span className="text-gradient-cyan">Scope</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Como Funciona</a>
            <a href="#pricing" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Precios</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs text-text-secondary hover:text-text-primary transition-colors px-3 py-2">
              Iniciar Sesion
            </Link>
            <Link to="/register" className="btn-primary text-xs px-4 py-2">
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 hex-grid-bg opacity-30 pointer-events-none" />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.03), transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/5 border border-accent-cyan/10 mb-6">
              <motion.div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
              <span className="text-[10px] text-accent-cyan font-medium tracking-wide uppercase">SOC Platform v2.0</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold text-text-primary leading-tight mb-6"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
          >
            {t('landing.heroTitle').split(' ').map((word, i) => (
              <span key={i}>
                {i >= 3 ? <span className="text-gradient-cyan">{word} </span> : `${word} `}
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
          >
            {t('landing.heroSubtitle')}
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.3 }}
          >
            <Link to="/register" className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
              <Icon name="zap" size={16} />
              {t('landing.startFree')}
            </Link>
            <Link to="/login" className="btn-secondary px-6 py-3 text-sm flex items-center gap-2">
              <Icon name="play" size={16} />
              {t('landing.viewDemo')}
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-16 flex items-center justify-center gap-8 flex-wrap"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.5 }}
          >
            <p className="text-[10px] text-text-muted uppercase tracking-widest w-full mb-2">{t('landing.trustedBy')}</p>
            {['TLS 1.3 Encrypted', 'SOC 2 Compliant', 'ISO 27001', 'GDPR Ready'].map(badge => (
              <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <Icon name="shield-check" size={11} className="text-accent-cyan/60" />
                <span className="text-[10px] text-text-muted font-medium">{badge}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ========== FEATURES ========== */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <h2 className="text-3xl font-bold text-text-primary mb-3">Todo lo que tu SOC Necesita</h2>
            <p className="text-sm text-text-secondary max-w-xl mx-auto">Una plataforma unificada para monitoreo, deteccion, respuesta y cumplimiento de seguridad.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card p-6 group hover:border-accent-cyan/10 transition-all duration-300"
                {...stagger}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/8 border border-accent-cyan/10 flex items-center justify-center mb-4 group-hover:bg-accent-cyan/12 transition-colors">
                  <Icon name={f.icon} size={18} className="text-accent-cyan" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <h2 className="text-3xl font-bold text-text-primary mb-3">Activo en 5 Minutos</h2>
            <p className="text-sm text-text-secondary">Sin configuraciones complejas. Sin consultoria. Sin friccion.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.num} className="relative" {...stagger} transition={{ delay: i * 0.15, duration: 0.5 }}>
                <div className="text-5xl font-bold text-accent-cyan/10 mb-3">{step.num}</div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">{step.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-text-muted/20">
                    <Icon name="arrow-right" size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section id="pricing" className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-10" {...fadeUp}>
            <h2 className="text-3xl font-bold text-text-primary mb-3">Precios Simples y Transparentes</h2>
            <p className="text-sm text-text-secondary mb-6">Sin sorpresas. Cancela cuando quieras.</p>

            <div className="inline-flex items-center rounded-lg bg-surface-2/50 border border-white/[0.04] p-0.5">
              {['monthly', 'annual'].map(cycle => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${billingCycle === cycle ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-muted hover:text-text-secondary'
                    }`}
                >
                  {cycle === 'monthly' ? 'Mensual' : 'Anual (-40%)'}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`glass-card p-6 relative !overflow-visible ${plan.highlight ? 'border-accent-cyan/20 glow-cyan' : ''}`}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {plan.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-[9px] text-accent-cyan font-medium uppercase tracking-wider">
                    Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-text-primary mb-1">{plan.name}</h3>
                <p className="text-[10px] text-text-muted mb-4">{plan.desc}</p>
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    {plan.price !== 'Custom' && <span className="text-xs text-text-muted">$</span>}
                    <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                    <span className="text-xs text-text-muted">{plan.period}</span>
                  </div>
                  {billingCycle === 'annual' && plan.annualTotal && (
                    <div className="text-[10px] text-accent-cyan/80 mt-1 font-medium italic">
                      Facturado anualmente: ${plan.annualTotal}
                    </div>
                  )}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                      <Icon name="check" size={13} className="text-accent-cyan flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center text-xs py-2.5 rounded-lg font-medium transition-all ${plan.highlight ? 'btn-primary' : 'btn-secondary'
                    }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ========== CTA ========== */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <motion.div className="max-w-2xl mx-auto text-center" {...fadeUp}>
          <h2 className="text-3xl font-bold text-text-primary mb-4">Protege tu Infraestructura Hoy</h2>
          <p className="text-sm text-text-secondary mb-8">Unete a miles de equipos que confian en HawkScope para proteger sus sistemas criticos.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-3 text-sm flex items-center gap-2">
              <Icon name="zap" size={16} />
              Comenzar Gratis
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-10 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src={logo} alt="Logo" className="w-6 h-6 object-contain pointer-events-none" />
            <span className="text-xs font-bold text-text-primary">
              Hawk<span className="text-gradient-cyan">Scope</span>
            </span>
          </div>
          <p className="text-[10px] text-text-muted">2024 HawkScope. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            {['Privacidad', 'Terminos', 'Contacto'].map(link => (
              <a key={link} href="#" className="text-[10px] text-text-muted hover:text-text-primary transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
