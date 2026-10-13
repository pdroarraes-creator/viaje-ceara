# Como colocar o assistente no ar (Cloudflare + Gemini)

Tempo: uns 15 minutos. Tudo pelo navegador, sem instalar nada. As contas são gratuitas.

## 1. Chave do Gemini

1. Entre em https://aistudio.google.com/apikey com sua conta Google.
2. Clique em **Create API key** e copie a chave. Guarde-a num lugar seguro, não cole em nenhum chat.

## 2. Criar o servidor no Cloudflare

1. Crie uma conta gratuita em https://dash.cloudflare.com/sign-up.
2. No menu, vá em **Workers & Pages** → **Create** → **Create Worker**.
3. Dê o nome **viaje-ceara-ask** e clique em **Deploy**.
4. Clique em **Edit code**, apague o código de exemplo e cole todo o conteúdo do arquivo `worker/index.js` deste repositório. Clique em **Deploy**.

## 3. Criar a memória das perguntas (KV)

1. No menu, vá em **Storage & Databases** → **KV** → **Create a namespace**. Nome: **viaje-ceara-qa**.
2. Volte ao worker **viaje-ceara-ask** → **Settings** → **Bindings** → **Add** → **KV namespace**.
3. Em *Variable name* escreva **QA** e escolha o namespace **viaje-ceara-qa**. Salve.

## 4. Senha e chaves (como segredos)

No worker → **Settings** → **Variables and Secrets** → **Add**, escolha o tipo **Secret** para cada um:

| Nome | Valor |
|---|---|
| `GEMINI_API_KEY` | a chave do passo 1 |
| `SITE_PASSWORD` | a senha que o grupo vai usar |
| `ADMIN_KEY` | outra senha, só sua, para ver todas as perguntas |

Clique em **Deploy** depois de salvar.

## 5. Ligar o site ao servidor

Copie o endereço do worker (algo como `https://viaje-ceara-ask.SEU-USUARIO.workers.dev`) e mande para o Claude. Ele coloca o endereço no site e publica de novo.

## Ver as perguntas salvas

Abra `https://viaje-ceara-ask.SEU-USUARIO.workers.dev/admin`, digite a `ADMIN_KEY` e copie o texto que aparece. Cole no Claude para melhorar o site com base nas perguntas.

## Custos e limites

- O plano gratuito do Gemini e do Cloudflare costuma bastar para um grupo de família. No plano gratuito, o Google pode usar as perguntas para melhorar os modelos dele.
- Cada pessoa pode fazer até 30 perguntas por hora.
- A senha e as chaves nunca ficam no código do site nem no GitHub.
