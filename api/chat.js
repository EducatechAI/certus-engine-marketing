const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Carrega as variáveis de ambiente (Chave da API de LLM / OpenRouter / OpenAI)
const API_KEY = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || "";
const API_URL = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completures";
const MODEL_NAME = process.env.CHAT_MODEL_NAME || "gpt-4o-mini";

// Caminho para o arquivo da Base de Conhecimento
const KB_PATH = path.join(__dirname, '..', 'docs', 'Certus_SDK_Internal', 'dossiês', 'BASE_CONHECIMENTO_245_QA.md');

// System Prompt de Ferro (The Iron Prompt) do Certus Engine
const SYSTEM_PROMPT = `
Você é a voz oficial do Certus Engine (Sovereign Governance Model). Sua única missão é sanar dúvidas de desenvolvedores, empresas, órgãos governamentais e instituições de ensino sobre a tecnologia Certus Engine, baseando-se estritamente na base de conhecimento oficial fornecida.

### 🛡️ Regras de Comportamento e Resposta:
1. **Veracidade Estrita:** Responda apenas com fatos contidos na base de conhecimento. Se o usuário fizer perguntas fora do escopo ou caso você não possua a resposta precisa na base de dados, execute o funil de trial. Nunca invente capacidades técnicas.
2. **Identidade:** Comporte-se como um assistente técnico-operacional determinístico. Evite linguagem comercial em excesso e valorize a integridade e precisão matemática.
3. **Fechamento e Convite:** Sempre encerre a resposta de maneira proativa perguntando "O que mais deseja saber?" ou convidando-o de forma assertiva: "Você pode baixar nosso Certus Studio Sovereign ou Command, grátis por 30 dias. O que acha de nos testar?".
4. **Alinhamento de Órgãos Públicos:** Se o usuário se identificar ou você detectar interesse relacionado a Prefeituras, Consórcios Públicos, Governos ou Universidades, encaminhe-os para a contratação rápida via CPSI (Lei 182/2021 Marco Legal das Startups) sob o Pacote Diamante (on-premise), solicitando agendamento técnico pelo e-mail enterprise@certus.engine. Omitir quaisquer valores comerciais e de preços para discussão exclusiva na mesa de negociação comercial.
`;

let baseConhecimentoCache = "";

function carregarBaseConhecimento() {
    if (baseConhecimentoCache) return baseConhecimentoCache;
    
    // Lista de caminhos possíveis para encontrar o arquivo dependendo de onde a API rodar
    const caminhosPossiveis = [
        KB_PATH,
        path.join(__dirname, 'BASE_CONHECIMENTO_245_QA.md'),
        path.join(process.cwd(), 'docs', 'Certus_SDK_Internal', 'dossiês', 'BASE_CONHECIMENTO_245_QA.md'),
        path.join(process.cwd(), 'BASE_CONHECIMENTO_245_QA.md')
    ];

    for (const caminho of caminhosPossiveis) {
        if (fs.existsSync(caminho)) {
            try {
                baseConhecimentoCache = fs.readFileSync(caminho, 'utf8');
                console.log(`[Certus-API] Base de conhecimento carregada com sucesso do caminho: ${caminho}`);
                return baseConhecimentoCache;
            } catch (err) {
                console.error(`[Certus-API] Erro ao ler base de conhecimento em ${caminho}:`, err);
            }
        }
    }
    
    console.warn("[Certus-API] Aviso: BASE_CONHECIMENTO_245_QA.md não encontrada nos caminhos padrão. Executando em modo sem banco de dados local.");
    return "";
}

// Endpoint do Chatbot
app.post('/api/chat', async (req, res) => {
    const { message, history = [] } = req.body;

    if (!message) {
        return res.status(400).json({ error: "O campo 'message' é obrigatório." });
    }

    const kb = carregarBaseConhecimento();

    // Se não houver chave de API configurada, utiliza a lógica inteligente de fallback local para manter o bot online
    if (!API_KEY) {
        console.log("[Certus-API] Chave de API não encontrada. Usando motor de fallback determinístico.");
        const reply = processarFallbackLocal(message);
        return res.json({ reply });
    }

    try {
        const messages = [
            { role: "system", content: SYSTEM_PROMPT + "\n\n### BASE DE CONHECIMENTO DISPONÍVEL:\n" + kb },
            ...history.map(msg => ({ role: msg.sender === 'outgoing' ? 'user' : 'assistant', content: msg.text })),
            { role: "user", content: message }
        ];

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: messages,
                temperature: 0.1 // Temperatura baixa para evitar alucinações e manter a resposta determinística
            })
        });

        if (!response.ok) {
            throw new Error(`Falha no provedor de LLM externo: Status ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        return res.json({ reply });

    } catch (error) {
        console.error("[Certus-API] Erro na requisição de API:", error);
        // Fallback robusto se a API de LLM externa falhar ou der timeout
        const reply = processarFallbackLocal(message);
        return res.json({ reply });
    }
});

function processarFallbackLocal(message) {
    const lower = message.toLowerCase().trim();

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
        
Gostaria de agendar uma mesa técnica ou receber os laudos do Laboratório Pré-Piloto? Entre em contato pelo e-mail: **enterprise@certus.engine** ou fale com um de nossos engenheiros corporativos. O que mais deseja saber?`;
    }

    if (lower.includes('preço') || lower.includes('valor') || lower.includes('custo') || lower.includes('comprar') || lower.includes('contratar') || lower.includes('planos')) {
        return `O Certus Engine oferece soluções de governança e segurança ativa sob medida:
        
1. **Certus Studio Sovereign:** IDE para desenvolvedores e startups individuais (PII-Zero na borda, Explainability Gate, trial de 30 dias).
2. **Certus Studio Command:** Para médias/grandes empresas e setores regulados (Tribunal de CPUs, Circuit Breaker Financeiro, segurança reativa <50ms).
3. **Pacote GOV Diamante:** On-premise soberano para prefeituras e órgãos públicos.
        
Você pode baixar nosso Certus Studio Sovereign ou Command e testar grátis por 30 dias. O que acha de nos testar? Para propostas corporativas customizadas, fale com vendas em **enterprise@certus.engine**.`;
    }

    return `Entendido. As IDEs Certus Studio Sovereign e Command contam com governança atômica Tier A+, proteção ativa a dados pessoais na borda (PII-Zero) e defesa cibernética de kernel integrada.
    
Você pode baixar nosso Certus Studio Sovereign ou Command e testar grátis por 30 dias. O que acha de nos testar?
    
Caso precise de detalhes técnicos específicos sobre as regras de governança ou os 12 agentes, me diga: O que mais deseja saber?`;
}

// Exporta o app para ambientes Serverless (como Vercel)
module.exports = app;
