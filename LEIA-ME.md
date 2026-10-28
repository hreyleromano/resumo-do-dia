# Resumo do dia

Aplicação em português para computador e celular. Cole uma conversa, filtre uma data, confira o trecho e gere um resumo na tela. Sem banco de dados ou histórico próprio. Não exige exportação do ChatGPT.

## O que já funciona

- Texto colado e filtragem por cabeçalhos `INÍCIO DO DIA 28/10/2026`, `28/10/2026`, `2026-10-28` ou timestamps no início da linha, como `28/10/2026 09:30`.
- Datas dentro de frases comuns não são consideradas datas de envio.
- Todos os blocos da data escolhida são reunidos; o texto antes do primeiro marcador fica de fora.
- Seleção manual com confirmação quando não houver datas.
- Prévia editável do trecho, exemplo fictício, limpeza e cópia do resumo.
- Resumo básico gratuito: seleção estatística de até sete frases representativas, executada no navegador. É um resumo extrativo; não sintetiza conclusões novas nem garante que todos os assuntos sejam representados.
- Modo IA opcional, com chave Gemini no servidor e código de acesso.
- Tentativa de importação de link oficial `https://chatgpt.com/share/...` pelo servidor, sem cookies ou login.

## Limites importantes

O link não garante extração. O importador só reconhece elementos de mensagens presentes no HTML retornado. Não executa scripts, não interpreta o protocolo interno de streaming do ChatGPT e não contorna bloqueios. Se a página exigir JavaScript, login ou retornar bloqueio, a interface orienta a colar o texto. Não inventa datas nem deduz datas de referências no conteúdo. O link de teste não foi lido com sucesso anteriormente; a importação real continua sem validação ponta a ponta.

Os cabeçalhos informados pelo usuário são tratados como limites de dia; isso não comprova quando uma mensagem foi enviada. Não há conversão de fuso: use os marcadores no horário local desejado, por exemplo Brasília. A data inicial da interface usa Brasília. Não identifica qual pessoa escreveu na conta compartilhada. Imagens, áudio e anexos não são processados.

## Publicar gratuitamente no Netlify

O uso gratuito depende dos limites e condições vigentes do Netlify. Não é necessário ativar IA para usar o modo básico.

1. Crie um repositório **privado** no GitHub e envie todo o conteúdo desta pasta. Não envie chaves nem senhas.
2. No Netlify, escolha **Add new project → Import an existing project** e conecte esse repositório.
3. Escolha a pasta raiz como base. Deixe o comando de build vazio. A pasta de publicação é `public`, e a pasta de funções é `netlify/functions`; o `netlify.toml` já configura isso.
4. Publique e abra o endereço HTTPS fornecido pelo Netlify, no celular ou computador.
5. Clique em **Usar exemplo fictício**, filtre o dia e gere o resumo básico. Depois experimente seu texto.

Não envie apenas `public` pelo arrastar e soltar: isso publica a interface, mas não prepara as funções de importação e IA. O fluxo via repositório instala as funções corretamente.

### IA opcional

1. Crie uma chave no Google AI Studio, se houver disponibilidade de cota gratuita para sua conta e região. Confira preços, elegibilidade e política de dados; não ative cobrança se não quiser custos. Algumas cotas gratuitas podem ser zero. Este projeto não garante oferta gratuita do provedor.
2. No Netlify, em configurações do projeto → variáveis de ambiente, configure para Functions:
   - `GEMINI_API_KEY`: sua chave, marcada como secreta.
   - `APP_PASSWORD`: um código longo e aleatório para impedir uso casual da sua cota por terceiros.
   - `GEMINI_MODEL`: opcional, padrão `gemini-2.5-flash`. Ajuste se o provedor alterar os modelos disponíveis.
3. Faça um novo deploy.
4. Na página, escolha **IA** e digite o código de acesso. A chave da API nunca vai para o navegador. O código não é salvo pela aplicação.

O código é uma proteção básica, não um sistema completo de autenticação ou limitação de requisições. Não publique código ou chave em repositórios. Configure limites de uso e acompanhe a cota do provedor.

## Privacidade

O modo básico não envia o texto para um serviço de IA. O navegador mantém o conteúdo apenas enquanto a página está aberta; o projeto não usa localStorage, cookies ou banco. Seu navegador ou sistema operacional podem ter mecanismos próprios de restauração ou área de transferência. Use **Limpar tudo** ao terminar.

A importação envia o link ao servidor Netlify e acessa o ChatGPT. Links compartilhados são acessíveis a quem tiver o endereço. O modo IA envia somente o trecho selecionado e a data ao Netlify e ao Gemini. A aplicação não grava conteúdo nem o registra em logs; retenção técnica e processamento dos provedores seguem as políticas deles. Não cole informações que não deseja enviar a esses provedores no modo IA.

## Desenvolvimento e verificações

Requer Node 20 ou superior. Não há dependências de execução.

```sh
node test/core.test.mjs
node --check public/app.js
node --check netlify/functions/import.mjs
node --check netlify/functions/summarize.mjs
```

Para testar interface e funções no computador, instale/use o Netlify CLI:

```sh
npx netlify-cli dev
```

Oito testes automatizados cobrem separação de dias, blocos repetidos, datas no meio de frases, validade de datas, fidelidade dos trechos básicos, restrição de URLs, leitura de HTML e bloqueio de IA sem configuração. Não houve teste visual em navegador nem integração real com Netlify/Gemini neste ambiente. Nenhuma chave ou conta Netlify estava conectada, portanto o projeto não está publicado.
