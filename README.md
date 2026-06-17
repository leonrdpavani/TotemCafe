Totem Café — Projeto de Totem de Autoatendimento
================================================

Descrição
---------
Pequeno projeto de totem para autoatendimento (trabalho/entrega acadêmica). Serve para
simular um fluxo de compra simples: navegar pelo menu, adicionar itens ao carrinho e
finalizar com um botão de pagamento.

Requisitos
----------
- Java 11 ou superior
- Maven

Como executar (desenvolvimento)
-------------------------------
Abra um terminal na pasta do projeto e rode (usa plugin JavaFX):

"mvn javafx:run"

Depois abra no navegador:

"http://localhost:4567"

Páginas principais
------------------
- `/` — tela inicial (iniciar compra)
- `/menu.html` — catálogo de itens
- `/cart.html` — resumo do carrinho
- `/payment.html` — pagamento (botão "Pagar agora")
- `/thankyou.html` — agradecimento

- `/admin.html` — página utilizada pelo estabelecimento

APIs (para referência rápida)
----------------------------
- `GET /api/catalog` — lista de produtos
- `GET /api/cart` — estado atual do carrinho (retorna `{ items, total }`)
- `POST /api/cart/add` — adiciona item ao carrinho
- `POST /api/cart/remove` — remove item do carrinho
- `POST /api/checkout` — finaliza pedido
- `GET /api/orders` — lista de pedidos em memória

Diagrama UML
-------------
Abaixo está o diagrama de classes do projeto (PNG). Se o PNG não carregar no seu visualizador,
abra o arquivo SVG que também está disponível.

![Diagrama de classes](docs/uml/diagram.png)

[Versão SVG (alternativa)](docs/uml/diagram.svg)

Testes manuais (passo a passo)
------------------------------
1. Abra `http://localhost:4567` e clique para iniciar.
2. Vá em `/menu.html` e adicione alguns itens ao carrinho.
3. Abra `/cart.html` e confira quantidades e total.
4. Clique em "Ir para Pagamento" e, em seguida, "Pagar agora".
5. Você deve ser redirecionado para `/thankyou.html`.

Observações importantes
----------------------
- O projeto **não usa banco de dados** — tudo fica em memória enquanto o servidor estiver ativo.
- Pedidos são guardados numa lista em memória para demonstração — reiniciar o app limpa os dados.

Problemas comuns / Solução rápida
--------------------------------
- Se a página não abrir, verifique se o Maven terminou de compilar sem erros.
- Porta padrão é a do servidor embutido (Spark) — se houver conflito, pare o processo que usa a porta.

Autor: Leonardo Cornneli Pavani
-----
Trabalho realizado como exercício de programação.

Uso educacional / demonstração.
