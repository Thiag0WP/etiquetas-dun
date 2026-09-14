# Etiquetas DUN

Sistema para geração de etiquetas DUN (Data Universal de Numeração) com códigos de barras e QR codes.

## 📋 Funcionalidades

- ✅ Geração de etiquetas DUN individuais
- ✅ Importação em lote via arquivo CSV
- ✅ Códigos de barras no padrão GS1
- ✅ QR codes para facilitar a leitura
- ✅ Interface responsiva e moderna
- ✅ Impressão otimizada das etiquetas

## 🛠️ Tecnologias

- **Framework:** Next.js 15.5.3
- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Códigos de Barras:** react-barcode
- **Processamento CSV:** PapaParse

## 🚀 Como executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/SEU_USUARIO/etiquetas-dun.git
cd etiquetas-dun
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as dependências específicas do projeto:

```bash
npm run setup
```

4. Execute o projeto em modo de desenvolvimento:

```bash
npm run dev
```

5. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📖 Como usar

### Etiqueta Individual

1. Acesse a página inicial
2. Selecione "Etiqueta Individual"
3. Preencha os dados do produto
4. Clique em "Gerar Etiqueta"
5. Use o botão de impressão para imprimir

### Importação CSV

1. Acesse "Importar CSV"
2. Faça upload de um arquivo CSV com as colunas (cabeçalho na primeira linha):
   - `sku` (código SKU do produto)
   - `gtin14` (GTIN-14, 14 dígitos)
   - `product` (nome do produto)
   - `qtyPerBox` (quantidade por caixa)

   Também são aceitos os cabeçalhos em português `SKU`, `GTIN-14`, `Produto`
   e `QUANTIDADE POR CAIXA`. Use o botão "Baixar modelo CSV" na página de
   Etiqueta Individual para baixar um exemplo pronto.
3. Visualize e imprima as etiquetas geradas

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── _components/         # Componentes reutilizáveis
│   │   └── DunLabel.tsx    # Componente da etiqueta
│   ├── _hooks/             # Hooks reutilizáveis
│   │   └── useLabelWorkspace.ts # Estado e ações das páginas de etiqueta
│   ├── _utils/             # Utilitários
│   │   └── csvParser.ts    # Conversão de linhas CSV em etiquetas
│   ├── dun/                # Páginas DUN
│   │   ├── csv/            # Importação CSV
│   │   └── gs1/            # Etiqueta individual
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página inicial
├── data/
│   └── dun.ts              # Dados e tipos DUN
└── types/
    └── dun.ts              # Definições TypeScript
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.
