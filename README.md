# Resumo do dia

Ferramenta para filtrar uma conversa por data e mostrar seu resumo na tela, sem banco de dados.

[Publicar no Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/hreyleromano/resumo-do-dia)

Consulte [LEIA-ME.md](LEIA-ME.md) para instruções, privacidade, limites da importação e configuração opcional do Gemini.

O modo básico funciona sem chave de IA, selecionando trechos do texto. O modo IA exige configuração. A importação por link é uma tentativa e pode falhar; nesse caso, cole o texto. Datas ausentes não são adivinhadas.

## Configuração Netlify

- Branch: `main`
- Build command: vazio
- Publish directory: `public`
- Functions: `netlify/functions` (configurado em `netlify.toml`)

## Verificar

Requer Node 20+. Execute `npm test`.
