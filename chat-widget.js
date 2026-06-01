(function() {
    // 🏛️ BASE_CONHECIMENTO_245_QA.md - Lógica de Match do Agente Certus Engine
    // Quando não encontra resposta direta na base, aciona o funil estratégico.
    
    // Injeta estilos CSS do Widget (Emerald Glass Modern Aesthetic)
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --certus-emerald: #10b981;
            --certus-emerald-glow: rgba(16, 185, 129, 0.15);
            --certus-dark-bg: rgba(10, 15, 30, 0.85);
            --certus-border: rgba(16, 185, 129, 0.2);
            --certus-text: #f3f4f6;
            --certus-text-muted: #9ca3af;
        }

        #certus-chat-trigger {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #065f46, #047857);
            box-shadow: 0 0 20px var(--certus-emerald-glow), inset 0 0 10px rgba(16, 185, 129, 0.4);
            border: 1px solid var(--certus-border);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #certus-chat-trigger:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
        }

        #certus-chat-trigger svg {
            width: 28px;
            height: 28px;
            fill: #fff;
            transition: transform 0.3s ease;
        }

        /* Estilos do Chat Bubble Callout Retrátil */
        #certus-bubble-callout {
            position: fixed;
            bottom: 105px;
            right: 30px;
            width: 260px;
            background: var(--certus-dark-bg);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid var(--certus-border);
            border-radius: 18px;
            padding: 12px 35px 12px 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 0 15px var(--certus-emerald-glow);
            z-index: 9997;
            font-size: 0.8rem;
            color: var(--certus-text);
            line-height: 1.4;
            opacity: 0;
            transform: translateY(10px) scale(0.95);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
        }

        #certus-bubble-callout.active {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

        #certus-bubble-callout::after {
            content: "";
            position: absolute;
            bottom: -8px;
            right: 22px;
            border-width: 8px 8px 0;
            border-style: solid;
            border-color: rgba(10, 15, 30, 0.85) transparent;
            display: block;
            width: 0;
        }

        #certus-bubble-close {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: rgba(255,255,255,0.08);
            border: none;
            color: var(--certus-text-muted);
            font-size: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        #certus-bubble-close:hover {
            background: rgba(255,255,255,0.15);
            color: var(--certus-text);
        }

        #certus-chat-window {
            position: fixed;
            bottom: 110px;
            right: 30px;
            width: 380px;
            height: 520px;
            border-radius: 24px;
            background: var(--certus-dark-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--certus-border);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5), 0 0 30px var(--certus-emerald-glow);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 9998;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #certus-chat-window.active {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

        .certus-chat-header {
            padding: 20px;
            background: linear-gradient(135deg, rgba(6, 95, 70, 0.4), rgba(4, 120, 87, 0.2));
            border-bottom: 1px solid var(--certus-border);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .certus-chat-header-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #047857;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #10b981;
            box-shadow: 0 0 10px var(--certus-emerald-glow);
        }

        .certus-chat-header-info h3 {
            margin: 0;
            font-size: 1rem;
            color: var(--certus-text);
            font-weight: 700;
        }

        .certus-chat-header-info p {
            margin: 2px 0 0 0;
            font-size: 0.75rem;
            color: var(--certus-emerald);
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .certus-chat-header-info p::before {
            content: "";
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 6px #10b981;
        }

        .certus-chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
            scroll-behavior: smooth;
        }

        .certus-message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 0.875rem;
            line-height: 1.45;
        }

        .certus-message.incoming {
            background: rgba(255, 255, 255, 0.05);
            color: var(--certus-text);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .certus-message.outgoing {
            background: linear-gradient(135deg, #065f46, #047857);
            color: #fff;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            border: 1px solid var(--certus-border);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .certus-chat-input-area {
            padding: 15px 20px;
            border-top: 1px solid var(--certus-border);
            display: flex;
            gap: 10px;
            background: rgba(5, 5, 10, 0.5);
        }

        .certus-chat-input {
            flex: 1;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--certus-border);
            border-radius: 9999px;
            padding: 10px 18px;
            color: var(--certus-text);
            font-size: 0.875rem;
            outline: none;
            transition: all 0.3s ease;
        }

        .certus-chat-input:focus {
            border-color: #10b981;
            box-shadow: 0 0 10px var(--certus-emerald-glow);
            background: rgba(255, 255, 255, 0.08);
        }

        .certus-chat-send {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: #047857;
            border: 1px solid var(--certus-border);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .certus-chat-send:hover {
            background: #059669;
            transform: scale(1.05);
        }

        .certus-chat-send svg {
            width: 16px;
            height: 16px;
            fill: #fff;
        }

        .certus-system-link {
            display: inline-block;
            margin-top: 8px;
            color: #10b981;
            text-decoration: underline;
            font-weight: 700;
            cursor: pointer;
        }

        .certus-system-link:hover {
            color: #34d399;
        }
    `;
    document.head.appendChild(style);

    // Estruturação do HTML do widget
    const widgetContainer = document.createElement('div');
    widgetContainer.innerHTML = `
        <div id="certus-bubble-callout">
            <button id="certus-bubble-close" title="Fechar">×</button>
            <span id="certus-bubble-text">Dúvidas sobre contratação via CPSI (Lei 182/2021) ou IDE Sovereign? Pergunte-me!</span>
        </div>
        <div id="certus-chat-trigger" title="Falar com o Certus Engine">
            <svg viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.13 2 11.23c0 2.92 1.47 5.54 3.78 7.26l-.88 3.51a.75.75 0 0 0 1.1.84l4.08-2.28A9.85 9.85 0 0 0 12 20.46c5.523 0 10-4.13 10-9.23S17.523 2 12 2zm0 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1.25-4.25a1.25 1.25 0 0 1-2.5 0v-2.5a1.25 1.25 0 0 1 2.5 0v2.5z"/>
            </svg>
        </div>
        <div id="certus-chat-window">
            <div class="certus-chat-header">
                <div class="certus-chat-header-avatar">
                    <span style="font-size: 1.1rem;">🐺</span>
                </div>
                <div class="certus-chat-header-info">
                    <h3>Certus Engine Sovereign</h3>
                    <p>Defesa e Governança Ativa</p>
                </div>
            </div>
            <div class="certus-chat-messages" id="certus-messages-container">
                <div class="certus-message incoming">
                    Olá! Eu sou o assistente do **Certus Engine**. Como posso ajudar você hoje com dúvidas de conformidade LGPD, segurança de dados e orquestração de IAs?
                </div>
            </div>
            <div class="certus-chat-input-area">
                <input type="text" class="certus-chat-input" id="certus-message-input" placeholder="Pergunte sobre IDE, 12 agentes, LGPD..." autocomplete="off">
                <button class="certus-chat-send" id="certus-send-btn">
                    <svg viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(widgetContainer);

    // Elementos da Interface
    const trigger = document.getElementById('certus-chat-trigger');
    const windowEl = document.getElementById('certus-chat-window');
    const inputEl = document.getElementById('certus-message-input');
    const sendBtn = document.getElementById('certus-send-btn');
    const messagesContainer = document.getElementById('certus-messages-container');
    const bubbleCallout = document.getElementById('certus-bubble-callout');
    const bubbleClose = document.getElementById('certus-bubble-close');
    const bubbleText = document.getElementById('certus-bubble-text');

    // Estado do Chat
    let chatActive = false;

    // Toggle do Chat
    trigger.addEventListener('click', () => {
        chatActive = !chatActive;
        windowEl.classList.toggle('active', chatActive);
        
        // Oculta o callout definitivamente quando o chat é aberto
        if (chatActive) {
            bubbleCallout.classList.remove('active');
        }
    });

    // Lógica do Bubble Callout (Notificação de Engajamento)
    const bubbleMessages = [
        "Dúvidas sobre contratação via CPSI (Lei 182/2021) ou IDE Sovereign? Pergunte-me!",
        "Descubra como o agente Lazarus protege e torna o código 'imortal'.",
        "Teste a IDE Sovereign ou Command grátis por 30 dias!"
    ];
    let currentBubbleIndex = 0;

    // Exibe o Callout após 5 segundos do carregamento da página
    setTimeout(() => {
        if (!chatActive) {
            bubbleCallout.classList.add('active');
        }
    }, 5000);

    // Rotaciona mensagens do callout a cada 10 segundos
    setInterval(() => {
        if (bubbleCallout.classList.contains('active') && !chatActive) {
            bubbleCallout.classList.remove('active');
            setTimeout(() => {
                currentBubbleIndex = (currentBubbleIndex + 1) % bubbleMessages.length;
                bubbleText.textContent = bubbleMessages[currentBubbleIndex];
                if (!chatActive) {
                    bubbleCallout.classList.add('active');
                }
            }, 600); // tempo para transição de opacidade
        }
    }, 12000);

    // Fechar manualmente o Callout
    bubbleClose.addEventListener('click', (e) => {
        e.stopPropagation(); // impede abrir o chat
        bubbleCallout.classList.remove('active');
    });

    // Lógica Comercial & Fallbacks
    function processQuery(query) {
        const lower = query.toLowerCase().trim();

        // 1. Verificações de Funil Público (Prefeituras, Consórcios e Universidades)
        if (
            lower.includes('prefeitura') || 
            lower.includes('municipio') || 
            lower.includes('secretaria') || 
            lower.includes('consorcio') || 
            lower.includes('governo') || 
            lower.includes('cidade') ||
            lower.includes('tce') ||
            lower.includes('tribunal de contas') ||
            lower.includes('faculdade') || 
            lower.includes('universidade') || 
            lower.includes('academico') ||
            lower.includes('escola')
        ) {
            return `Identifiquei o interesse em infraestrutura pública/educacional. 
            
            Para órgãos governamentais, prefeituras, consórcios municipais e instituições acadêmicas, nós fornecemos o **Pacote GOV Diamante (100% on-premise)**.
            
            O Certus Engine pode ser contratado de forma rápida e sem licitação tradicional através de um **CPSI (Contrato Público para Solução Inovadora)**, amparado pela **Lei Complementar nº 182/2021 (Marco Legal das Startups)**. Isso permite uma fase de validação tecnológica de até 24 meses com valores totalmente customizados para a realidade do município, definidos sob medida na mesa de negociação.
            
            Gostaria de agendar uma mesa técnica ou receber os laudos do Laboratório Pré-Piloto? Entre em contato pelo e-mail: **enterprise@certus.engine** ou <a href="contact.html" class="certus-system-link">Fale Conosco</a>.`;
        }

        // 2. Verificações de Termos de Vendas (IDE Sovereign, IDE Command)
        if (lower.includes('preço') || lower.includes('preços') || lower.includes('valor') || lower.includes('valores') || lower.includes('custo') || lower.includes('comprar') || lower.includes('contratar') || lower.includes('planos') || lower.includes('custa')) {
            return `O Certus Engine oferece soluções modulares para diferentes escalas:
            
- **Certus Studio Sovereign:** IDE individual focada em desenvolvedores e startups. A assinatura é de **R$ 79,90/mês** ou **R$ 840,00/ano**. Conta com 30 dias de trial gratuito.
- **Certus Studio Command:** Edição corporativa avançada para equipes e setores regulados. A assinatura é de **R$ 499,00/mês** ou **R$ 4.800,00/ano por máquina**.
- **Pacote GOV Diamante (CPSI):** Destinado exclusivamente a prefeituras, faculdades, universidades e bancos públicos. A contratação é efetuada de forma ágil com dispensa de licitação tradicional por meio de um **CPSI (Lei Complementar 182/2021)**, com valores sob medida negociados diretamente na mesa de propostas técnicas.
            
Você pode iniciar o seu teste grátis imediatamente na página de <a href="pricing.html" class="certus-system-link">Planos e Preços</a> ou falar direto com nossa engenharia comercial em **enterprise@certus.engine**.`;
        }

        // 3. Match com o Banco de Conhecimento (245 Q&As)
        // Mapeamento semântico básico para o protótipo local do widget
        const faqDatabase = [
            {
                keywords: ['pii-zero', 'dados pessoais', 'lgpd', 'mascaramento', 'privacidade'],
                answer: 'O **PII-Zero** é o scrubber ativo do Certus Engine. Ele atua na borda anonimizando dados sensíveis (CPF, e-mails, chaves de API, senhas) antes que a informação saia para qualquer LLM externa. Os dados originais são substituídos por nullifiers e os logs de conformidade são criptografados com assinatura Ed25519.'
            },
            {
                keywords: ['12 agentes', 'wolfdog', 'kangal', 'pitbull', 'presa', 'lazarus', 'ghost', 'forge', 'dogo', 'apex', 'sentinel', 'oracle', 'janitor'],
                answer: 'A arquitetura do Certus conta com 12 sub-agentes coordenados via barramento Ed25519:\n' +
                        '- **Wolfdog:** Watchdog de resiliência e persistência de kernel (anti-kill).\n' +
                        '- **Kangal:** Controle de perímetro e bloqueio na camada de transporte (WFP/iptables).\n' +
                        '- **Pitbull:** Defesa ativa de recursos e anti-ransomware (bloqueio em <50ms).\n' +
                        '- **Presa Canario:** Raiz de Confiança e integridade de arquivos via Merkle Trees.\n' +
                        '- **Lazarus:** Auto-healing e snapshots imutáveis no Shadow Vault.\n' +
                        '- **Ghost:** Reconhecimento furtivo de infraestrutura.\n' +
                        '- **Forge:** Geração automatizada de módulos baseada em políticas.\n' +
                        '- **Dogo Argentino:** Caça ativa a vulnerabilidades (CVEs).\n' +
                        '- **Janitor:** Limpeza inteligente de resíduos e logs LGPD Art. 16.\n' +
                        '- **Apex Guardian:** Resposta a incidentes em tempo real.\n' +
                        '- **Sentinel:** Monitoramento contínuo de saúde e telemetria.\n' +
                        '- **Oracle:** Tribunal de CPUs (consenso de 2/3).'
            },
            {
                keywords: ['sovereign', 'ide sovereign', 'desenvolvedor', 'startup'],
                answer: 'A **IDE Certus Studio Sovereign** foi desenhada para desenvolvedores e startups em fase de MVP. Ela integra governança atômica no ambiente de desenvolvimento: proteção PII-Zero no commit, logs assinados e de auditoria, e o Explainability Gate na borda. A assinatura é de R$ 79,90/mês ou R$ 840,00/ano, com um trial gratuito completo por 30 dias.'
            },
            {
                keywords: ['command', 'ide command', 'empresas', 'regulado'],
                answer: 'O **Certus Studio Command** é a edição corporativa com SLA de 99,5%. Ela adiciona inteligência defensiva reativa, controle de custos via Circuit Breaker Financeiro, o Tribunal de CPUs para consenso de modelos (votação 2/3) e relatórios forenses automatizados para auditorias. A assinatura é de R$ 499,00/mês ou R$ 4.800,00/ano por máquina.'
            },
            {
                keywords: ['lazarus', 'imortal', 'snapshot', 'shadow vault', 'merkle'],
                answer: 'O agente **Lazarus** garante a integridade determinística. A cada alteração válida, ele cria snapshots assinados com Ed25519 e os armazena no Shadow Vault (isolado/air-gapped). Caso ocorra um comprometimento de sistema ou ransomware, o Lazarus reconstrói e reestabelece o ambiente original em menos de 2 minutos.'
            },
            {
                keywords: ['consenso', 'tribunal', 'cpu', 'alucinação'],
                answer: 'O **Tribunal de CPUs** do Certus submete tarefas críticas a múltiplos modelos de IA simultaneamente. Para que a ação seja aprovada em produção, é exigido um consenso mínimo de 2/3. Se houver divergência, o gate entra em fail-closed e notifica o supervisor humano.'
            }
        ];

        // Busca na lista local de FAQs
        for (const item of faqDatabase) {
            if (item.keywords.some(kw => lower.includes(kw))) {
                return item.answer + `\n\nVocê pode baixar nosso Certus Studio Sovereign ou Command e testar grátis por 30 dias. O que acha de nos testar?\n\nCaso tenha outras dúvidas, me diga: O que mais deseja saber?`;
            }
        }

        // 4. FALLBACK GERAL: Direcionamento para trial de 30 dias ou e-mail de negócios
        return `Não localizei uma resposta precisa sobre este detalhe nos meus registros locais de governança. 
        
Você pode baixar nosso Certus Studio Sovereign ou Command e testar grátis por 30 dias. O que acha de nos testar?
        
Se preferir, entre em contato direto com nossa engenharia comercial no e-mail **enterprise@certus.engine**. Como posso te ajudar mais? O que mais deseja saber?`;
    }

    // Histórico de mensagens do chat
    let messageHistory = [];

    // Função para Inserir Mensagens
    function addMessage(text, side) {
        const msg = document.createElement('div');
        msg.className = `certus-message ${side}`;
        // Transforma quebras de linha em <br> e links HTML simples
        msg.innerHTML = text.replace(/\n/g, '<br>');
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Registra histórico
        messageHistory.push({ sender: side, text: text });
    }

    // Evento de Envio
    async function handleSend() {
        const query = inputEl.value.trim();
        if (!query) return;

        addMessage(query, 'outgoing');
        inputEl.value = '';

        // Efeito visual de digitação (typing indicator)
        const typingEl = document.createElement('div');
        typingEl.className = 'certus-message incoming';
        typingEl.style.fontStyle = 'italic';
        typingEl.style.color = 'var(--certus-text-muted)';
        typingEl.innerHTML = 'Certus Engine analisando...';
        messagesContainer.appendChild(typingEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: query,
                    history: messageHistory.slice(0, -1) // envia histórico anterior
                })
            });

            // Remove indicador de digitação
            messagesContainer.removeChild(typingEl);

            if (response.ok) {
                const data = await response.json();
                addMessage(data.reply, 'incoming');
            } else {
                throw new Error('Falha na resposta da API');
            }
        } catch (error) {
            // Remove indicador de digitação se ainda existir
            if (messagesContainer.contains(typingEl)) {
                messagesContainer.removeChild(typingEl);
            }
            console.warn('[Certus-Chat] Rota de rede offline ou indisponível. Acionando fallback determinístico local.');
            const reply = processQuery(query);
            addMessage(reply, 'incoming');
        }
    }

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
})();
