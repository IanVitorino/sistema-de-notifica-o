"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X, Check, Eye } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Lembrete {
  id: string;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  numeroExibicoes: number;
  numeroExibicoesLembrete: number;
}

export default function NotificationPanel() {
  const router = useRouter();
  const [lembretes, setLembretes] = useState<{
    disparados: Lembrete[];
    aguardandoConfirmacao: Lembrete[];
  }>({
    disparados: [],
    aguardandoConfirmacao: [],
  });
  const [loading, setLoading] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const previousTotalRef = useRef(0);

  // Inicializar permissão de notificações
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);

      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        // Verificar lembretes imediatamente
        fetchLembretes();
      }
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0.4, audioContext.currentTime);

      // Melodia extravagante: 6 notas ascendentes com harmônicos
      const melody = [
        { freq: 523.25, time: 0, duration: 0.15, type: 'sine' as OscillatorType },      // C5
        { freq: 659.25, time: 0.15, duration: 0.15, type: 'sine' as OscillatorType },   // E5
        { freq: 783.99, time: 0.30, duration: 0.15, type: 'sine' as OscillatorType },   // G5
        { freq: 1046.50, time: 0.45, duration: 0.25, type: 'triangle' as OscillatorType }, // C6 (oitava acima)
        { freq: 783.99, time: 0.70, duration: 0.12, type: 'sine' as OscillatorType },   // G5
        { freq: 1046.50, time: 0.82, duration: 0.35, type: 'square' as OscillatorType },  // C6 (final enfático)
      ];

      melody.forEach(note => {
        // Nota principal
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = note.type;
        osc.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.time);

        // Envelope ADSR (Attack, Decay, Sustain, Release)
        const attackTime = 0.02;
        const releaseTime = 0.08;

        gain.gain.setValueAtTime(0, audioContext.currentTime + note.time);
        gain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + note.time + attackTime);
        gain.gain.setValueAtTime(0.5, audioContext.currentTime + note.time + note.duration - releaseTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.time + note.duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(audioContext.currentTime + note.time);
        osc.stop(audioContext.currentTime + note.time + note.duration);

        // Adicionar harmônico (oitava acima) para notas importantes
        if (note.time >= 0.45) {
          const harmonic = audioContext.createOscillator();
          const harmonicGain = audioContext.createGain();

          harmonic.type = 'sine';
          harmonic.frequency.setValueAtTime(note.freq * 2, audioContext.currentTime + note.time);

          harmonicGain.gain.setValueAtTime(0, audioContext.currentTime + note.time);
          harmonicGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + note.time + attackTime);
          harmonicGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.time + note.duration);

          harmonic.connect(harmonicGain);
          harmonicGain.connect(masterGain);

          harmonic.start(audioContext.currentTime + note.time);
          harmonic.stop(audioContext.currentTime + note.time + note.duration);
        }
      });

      // Efeito de "brilho" final - tremolo rápido
      const finalEffect = audioContext.createOscillator();
      const finalGain = audioContext.createGain();
      const tremolo = audioContext.createGain();

      // Tremolo LFO
      const lfo = audioContext.createOscillator();
      lfo.frequency.setValueAtTime(12, audioContext.currentTime + 0.82); // Tremolo rápido
      const lfoGain = audioContext.createGain();
      lfoGain.gain.setValueAtTime(0.3, audioContext.currentTime + 0.82);

      lfo.connect(lfoGain);
      lfoGain.connect(tremolo.gain);

      finalEffect.type = 'sine';
      finalEffect.frequency.setValueAtTime(2093, audioContext.currentTime + 0.82); // C7 (muito agudo)

      finalGain.gain.setValueAtTime(0, audioContext.currentTime + 0.82);
      finalGain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.85);
      finalGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.17);

      tremolo.gain.setValueAtTime(1, audioContext.currentTime + 0.82);

      finalEffect.connect(finalGain);
      finalGain.connect(tremolo);
      tremolo.connect(masterGain);

      lfo.start(audioContext.currentTime + 0.82);
      lfo.stop(audioContext.currentTime + 1.17);
      finalEffect.start(audioContext.currentTime + 0.82);
      finalEffect.stop(audioContext.currentTime + 1.17);

    } catch (err) {
      console.log("Erro ao tocar som:", err);
    }
  };

  const showBrowserNotification = (lembrete: Lembrete) => {
    if (notificationPermission === "granted") {
      // Tocar som junto com a notificação
      playNotificationSound();

      const prioridadeEmoji = {
        URGENTE: "🔴",
        ALTA: "🟠",
        MEDIA: "🟡",
        BAIXA: "🔵",
      };

      const emoji = prioridadeEmoji[lembrete.prioridade as keyof typeof prioridadeEmoji] || "🔔";

      const notification = new Notification(`${emoji} ${lembrete.titulo}`, {
        body: lembrete.descricao || "Você tem um lembrete pendente",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: lembrete.id,
        requireInteraction: true,
        silent: false, // Usar som do sistema
        vibrate: [200, 100, 200], // Vibração em dispositivos móveis
        data: {
          lembreteId: lembrete.id,
          url: window.location.href,
        },
      });

      notification.onclick = () => {
        window.focus();
        setMinimized(false);
        notification.close();
      };

      // Reexibir a notificação a cada 3 minutos se não for fechada
      const renotifyInterval = setInterval(() => {
        if (document.hidden) {
          playNotificationSound();
          new Notification(`${emoji} LEMBRETE: ${lembrete.titulo}`, {
            body: `⚠️ Este lembrete ainda está pendente!\n\n${lembrete.descricao || "Clique para visualizar"}`,
            icon: "/favicon.ico",
            tag: `reminder-${lembrete.id}`,
            requireInteraction: true,
            silent: false,
            vibrate: [200, 100, 200, 100, 200],
          }).onclick = () => {
            window.focus();
            setMinimized(false);
            clearInterval(renotifyInterval);
          };
        } else {
          clearInterval(renotifyInterval);
        }
      }, 180000); // 3 minutos

      // Limpar intervalo quando a notificação for fechada
      notification.onclose = () => {
        clearInterval(renotifyInterval);
      };
    } else if (notificationPermission === "denied") {
      // Se notificações foram negadas, mostrar alerta
      alert(`🔔 LEMBRETE: ${lembrete.titulo}\n\n${lembrete.descricao || ""}\n\nPara receber notificações, ative as permissões no navegador!`);
      playNotificationSound();
    }
  };

  const processWorker = async () => {
    try {
      // Chamar o POST para processar lembretes pendentes
      await fetch("/api/lembretes/worker", {
        method: "POST",
      });
    } catch (error) {
      console.error("Erro ao processar worker:", error);
    }
  };

  const fetchLembretes = async () => {
    try {
      // Primeiro processar os lembretes
      await processWorker();

      // Depois buscar os lembretes atualizados
      const response = await fetch("/api/lembretes/worker");
      if (response.ok) {
        const data = await response.json();
        const novosLembretes = {
          disparados: data.disparados || [],
          aguardandoConfirmacao: data.aguardandoConfirmacao || [],
        };

        // Detectar novos lembretes disparados comparando IDs
        const idsAntigos = new Set(lembretes.disparados.map(l => l.id));
        const novosDisparados = novosLembretes.disparados.filter(
          l => !idsAntigos.has(l.id)
        );

        // Mostrar notificação do navegador para cada novo lembrete disparado
        if (novosDisparados.length > 0) {
          console.log(`🔔 ${novosDisparados.length} novo(s) lembrete(s) disparado(s)!`);

          novosDisparados.forEach(lembrete => {
            showBrowserNotification(lembrete);
          });

          // Se a aba não estiver ativa, tocar som adicional
          if (document.hidden) {
            // Tocar som múltiplas vezes para chamar atenção
            for (let i = 0; i < 3; i++) {
              setTimeout(() => playNotificationSound(), i * 800);
            }
          }
        }

        // Detectar novos lembretes aguardando confirmação
        const idsAguardandoAntigos = new Set(lembretes.aguardandoConfirmacao.map(l => l.id));
        const novosAguardando = novosLembretes.aguardandoConfirmacao.filter(
          l => !idsAguardandoAntigos.has(l.id)
        );

        if (novosAguardando.length > 0) {
          console.log(`⏰ ${novosAguardando.length} novo(s) lembrete(s) aguardando confirmação!`);
          playNotificationSound();
        }

        previousTotalRef.current = novosLembretes.disparados.length + novosLembretes.aguardandoConfirmacao.length;
        setLembretes(novosLembretes);
      }
    } catch (error) {
      console.error("Erro ao buscar lembretes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLembretes();

    // Verificar a cada 30 segundos (mais frequente para notificações urgentes)
    const interval = setInterval(() => {
      fetchLembretes();
    }, 30000);

    // Listener para quando a aba voltar a ficar visível
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("⚡ Aba ficou visível, verificando lembretes...");
        fetchLembretes();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listener para quando a janela receber foco
    const handleFocus = () => {
      console.log("⚡ Janela recebeu foco, verificando lembretes...");
      fetchLembretes();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleAction = async (lembreteId: string, action: string) => {
    try {
      const response = await fetch(`/api/lembretes/${lembreteId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchLembretes();
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao executar ação:", error);
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      URGENTE: "border-red-500",
      ALTA: "border-orange-500",
      MEDIA: "border-gray-500",
      BAIXA: "border-blue-500",
    };
    return colors[prioridade as keyof typeof colors] || "border-gray-500";
  };

  const totalNotifications =
    lembretes.disparados.length + lembretes.aguardandoConfirmacao.length;

  if (loading) {
    return null;
  }

  if (totalNotifications === 0) {
    return null;
  }

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setMinimized(false)}
          className="rounded-full h-14 w-14 relative"
          size="icon"
        >
          <Bell className="h-6 w-6" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalNotifications}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] overflow-hidden">
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  Lembretes Ativos ({totalNotifications})
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMinimized(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
          {lembretes.disparados.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-red-600">
                Disparados ({lembretes.disparados.length})
              </h3>
              {lembretes.disparados.map((lembrete) => (
                <div
                  key={lembrete.id}
                  className={`border-l-4 ${getPrioridadeColor(
                    lembrete.prioridade
                  )} pl-3 py-2 mb-2 bg-muted/50 rounded`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{lembrete.titulo}</h4>
                      {lembrete.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {lembrete.descricao}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Exibido {lembrete.numeroExibicoes}x
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(lembrete.id, "marcar_visto")}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Visto
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {lembretes.aguardandoConfirmacao.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-yellow-600">
                Aguardando Confirmação ({lembretes.aguardandoConfirmacao.length})
              </h3>
              {lembretes.aguardandoConfirmacao.map((lembrete) => (
                <div
                  key={lembrete.id}
                  className={`border-l-4 ${getPrioridadeColor(
                    lembrete.prioridade
                  )} pl-3 py-2 mb-2 bg-muted/50 rounded`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{lembrete.titulo}</h4>
                      {lembrete.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {lembrete.descricao}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Lembretes enviados: {lembrete.numeroExibicoesLembrete}x
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAction(lembrete.id, "confirmar")}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Confirmar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
