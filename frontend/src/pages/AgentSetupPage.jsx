import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Icon from '../components/icons/Icon'
import useAuthStore from '../store/authStore'

const AgentSetupPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)

  const backendUrl = import.meta.env.VITE_API_URL || 'https://hawkscope-backend.onrender.com/api'
  // El endpoint real del agente es /api/v1/agent/metrics
  const agentMetricsUrl = `${backendUrl}/api/v1/agent/metrics`.replace('/api/api/', '/api/') 

  const installCommand = `curl -fsSL https://raw.githubusercontent.com/LuisGuillermo-RamosDiaz/HawkScope/main/agente/install.sh | sudo bash -s -- --api-key=${user?.apiKey || '<TU_API_KEY>'} --api-url=${agentMetricsUrl}`

  const handleCopy = () => {
    const textToCopy = installCommand
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
    } else {
      // Fallback para contextos no seguros (HTTP por IP)
      const textArea = document.createElement("textarea")
      textArea.value = textToCopy
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err)
      }
      document.body.removeChild(textArea)
    }
  }

  useEffect(() => {
    if (step === 2) {
      setConnecting(true)
      setConnected(false)
      // Ya no simulamos éxito. El usuario debe esperar o el sistema debe ser honesto.
      // En una versión futura aquí se haría polling al backend.
    }
  }, [step])

  const steps = [
    { num: 1, title: t('agentSetup.step1Title'), desc: t('agentSetup.step1Desc') },
    { num: 2, title: t('agentSetup.step2Title'), desc: t('agentSetup.step2Desc') },
    { num: 3, title: t('agentSetup.step3Title'), desc: t('agentSetup.step3Desc') },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-surface-base)' }}>
      <div className="absolute inset-0 hex-grid-bg opacity-30 pointer-events-none" />
      <motion.div
        className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.03), transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative z-10 w-full max-w-[560px] mx-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card p-8 border-gradient relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px]">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-accent-cyan to-transparent"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan/15 to-accent-purple/15 border border-accent-cyan/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="terminal" size={24} className="text-accent-cyan" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">{t('agentSetup.title')}</h1>
            <p className="text-xs text-text-secondary">{t('agentSetup.subtitle')}</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  step >= s.num
                    ? 'bg-accent-cyan/15 border-accent-cyan/30 text-accent-cyan'
                    : 'bg-surface-3 border-white/[0.06] text-text-muted'
                }`}>
                  {step > s.num ? <Icon name="check" size={13} /> : s.num}
                </div>
                {i < 2 && <div className={`w-12 h-[1px] ${step > s.num ? 'bg-accent-cyan/30' : 'bg-white/[0.06]'}`} />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h3 className="text-sm font-semibold text-text-primary mb-2">{steps[0].title}</h3>
                <p className="text-xs text-text-secondary mb-4">{steps[0].desc}</p>

                <div className="relative group">
                  <div className="p-4 rounded-lg bg-surface-2/80 border border-white/[0.06] font-mono text-[11px] text-accent-cyan/80 break-all leading-relaxed">
                    {installCommand}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-surface-3/80 border border-white/[0.06] text-text-muted hover:text-text-primary transition-all"
                  >
                    <Icon name={copied ? 'check' : 'copy'} size={13} />
                  </button>
                </div>
                {copied && <p className="text-[10px] text-accent-cyan mt-2">{t('agentSetup.copied')}</p>}

                <div className="mt-4 p-3 rounded-lg bg-accent-amber/5 border border-accent-amber/10">
                  <div className="flex items-start gap-2">
                    <Icon name="info" size={13} className="text-accent-amber mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-text-muted">Compatible con Ubuntu 20+, Debian 11+, CentOS 8+, Alpine 3.16+, Docker, Kubernetes.</p>
                  </div>
                </div>

                <button onClick={() => setStep(2)} className="btn-primary w-full mt-6 py-2.5 text-sm flex items-center justify-center gap-2">
                  <span>{t('common.next')}</span>
                  <Icon name="arrow-right" size={14} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h3 className="text-sm font-semibold text-text-primary mb-2">{steps[1].title}</h3>
                <p className="text-xs text-text-secondary mb-6">{steps[1].desc}</p>

                <div className="flex flex-col items-center py-8">
                  {connecting && !connected && (
                    <>
                      <motion.div
                        className="w-16 h-16 rounded-full border-2 border-accent-cyan/20 border-t-accent-cyan flex items-center justify-center mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                      />
                      <p className="text-xs text-text-secondary text-center max-w-[280px]">
                        Esperando señal del agente... una vez que el script termine, tus métricas aparecerán aquí.
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setStep(3)}
                    className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    <span>{t('common.next')}</span>
                    <Icon name="arrow-right" size={14} />
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-2 text-[10px] text-text-muted hover:text-text-primary transition-colors"
                  >
                    Volver a ver el comando
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="flex flex-col items-center py-6">
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-cyan/15 to-accent-purple/15 border border-accent-cyan/20 flex items-center justify-center mb-5"
                    animate={{ boxShadow: ['0 0 20px rgba(0,240,255,0.1)', '0 0 40px rgba(0,240,255,0.2)', '0 0 20px rgba(0,240,255,0.1)'] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Icon name="check-circle" size={36} className="text-accent-cyan" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">Todo Listo</h3>
                  <p className="text-xs text-text-secondary text-center mb-8 max-w-xs">
                    Tu servidor esta conectado y enviando metricas. Tu dashboard esta listo para usar.
                  </p>

                  <div className="w-full space-y-3">
                    <button onClick={() => navigate('/dashboard')} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                      <Icon name="layout-dashboard" size={14} />
                      {t('agentSetup.goToDashboard')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip */}
          {step < 3 && (
            <div className="mt-4 text-center">
              <button onClick={() => navigate('/dashboard')} className="text-[10px] text-text-muted hover:text-text-primary transition-colors">
                {t('agentSetup.skipSetup')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AgentSetupPage
