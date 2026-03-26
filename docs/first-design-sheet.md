# Design Sheet — Versão 1

> Documento de referência para arte, gameplay e implementação futura. Aprovado pela direção criativa.

---

## Herói inicial

### Un1, o Unicórnio da Coroa Partida

- **Função:** herói inicial equilibrado
- **Identidade:** combina ataques diretos, geração de defesa e uma magia leve ligada a brasas e fragmentos mágicos
- **Passiva — Faísca da Coroa:** a primeira vez em cada turno em que o jogador usar uma carta de Ataque e uma carta de Habilidade, ganha 1 Brasa
- **Brasa:** recurso simples de combate. Algumas cartas gastam Brasa para efeitos extras
- **Por que funciona:** é fácil de entender, recompensa pequenas combinações e permite estilos mais agressivos ou mais defensivos
- **Direção visual inicial:** um unicórnio carismático, com visual de fantasia em pixel art, detalhes mágicos brilhantes e um fragmento da coroa incorporado ao design

---

## Cartas iniciais (10)

| # | Nome | Tipo | Custo | Efeito |
|---|------|------|-------|--------|
| 1 | Chifrada de Unicórnio | Ataque | 1 | Cause 6 de dano |
| 2 | Escudo Dourado | Habilidade | 1 | Ganhe 7 de bloqueio |
| 3 | Fogo em Brasa | Ataque | 1 | Cause 5 de dano. Se você tiver Brasa, cause +3 de dano |
| 4 | Investida | Habilidade | 0 | Ganhe 4 de bloqueio. Compre 1 carta |
| 5 | Diamantes da Coroa | Habilidade | 1 | Ganhe 1 Brasa. Compre 1 carta |
| 6 | Chifrada Dupla | Ataque | 1 | Cause 4 de dano duas vezes |
| 7 | Proteção Prateada | Habilidade | 1 | Ganhe 9 de bloqueio. Se você jogou um Ataque neste turno, ganhe 1 Brasa |
| 8 | Ferradura Dourada | Ataque | 1 | Cause 7 de dano e aplique 2 de Queimadura |
| 9 | Pulso do Relicário | Habilidade | 1 | Gaste toda a sua Brasa. Ganhe 5 de bloqueio e compre 1 carta para cada Brasa gasta |
| 10 | Queda da Coroa | Ataque | 2 | Cause 12 de dano. Gaste 1 Brasa para causar +6 de dano |

### Notas das cartas

- **Chifrada de Unicórnio:** carta simples e direta para o começo do jogo
- **Escudo Dourado:** base defensiva clara para o deck inicial
- **Fogo em Brasa:** incentiva o jogador a entender e usar o recurso de Brasa
- **Investida:** ajuda no ritmo do turno e melhora a fluidez do combate
- **Diamantes da Coroa:** carta de suporte para alimentar combos e consistência
- **Chifrada Dupla:** reforça a fantasia de combate físico do personagem e ajuda em interações futuras com múltiplos acertos
- **Proteção Prateada:** conecta defesa com o sistema de combo do personagem
- **Ferradura Dourada:** adiciona um pequeno efeito de status e amplia a variedade ofensiva
- **Pulso do Relicário:** carta de conversão de recurso, criando decisões táticas no combate
- **Queda da Coroa:** ataque de impacto maior, pensado como payoff simples para Brasa

---

## Inimigos comuns (3)

### Rato Oco
- **Função:** inimigo simples de introdução
- **Comportamento:** ataques fracos e, às vezes, se protege
- **Objetivo de design:** ensinar o básico de atacar e defender
- **Direção visual:** criatura pequena, rápida e levemente corrompida

### Acólito de Espinhos
- **Função:** inimigo de desgaste
- **Comportamento:** aplica um pequeno efeito negativo, como Queimadura ou enfraquecimento
- **Objetivo de design:** ensinar prioridade de alvo
- **Direção visual:** cultista corrompido com elementos vegetais ou espinhos mágicos

### Besouro das Ruínas
- **Função:** inimigo defensivo
- **Comportamento:** ganha armadura e depois prepara um ataque mais forte
- **Objetivo de design:** ensinar timing e janelas de burst
- **Direção visual:** inseto pesado, casco duro, aparência antiga e protegida por placas

---

## Elite (1)

### Cavaleiro Cinzento
- **Função:** primeiro teste real de habilidade
- **Comportamento:** alterna entre golpes pesados e uma postura fortificada que concede armadura e reflete pouco dano
- **Objetivo de design:** forçar equilíbrio entre defesa e explosão de dano, evitando jogo automático
- **Direção visual:** guerreiro corrompido, armadura antiga, presença intimidadora

---

## Chefe (1)

### Slime Corrompida
- **Função:** primeiro chefe da região
- **Visual:** uma slime grande e ameaçadora, com fragmentos da coroa e energia corrompida visíveis dentro do corpo gelatinoso
- **Comportamento:**
  - **Fase 1:** golpes de impacto, espalha gosma corrompida e cria pequenas massas de slime
  - **Fase 2:** absorve a corrupção acumulada para ganhar poder, aumentar a defesa ou preparar um grande esmagamento
- **Objetivo de design:** entregar um chefe fácil de ler, visualmente memorável e forte o bastante para marcar o fim da primeira área
- **Fantasia da luta:** o jogador sente que está enfrentando uma criatura instável, crescendo em ameaça conforme a corrupção domina o campo

---

## Relíquias (5)

### Anel de Brasa
Ganhe 1 Brasa no início de cada combate.

### Broquel Gasto
A primeira vez em cada combate que você ganhar bloqueio, ganhe +3 de bloqueio adicional.

### Presa de Rato
Seu primeiro Ataque de cada combate causa +2 de dano.

### Lasca da Coroa
A cada 3 turnos, compre 1 carta extra.

### Lanterna do Peregrino
Cure 4 de vida após lutas contra elites e chefes.

---

## Resumo de aprovação criativa

Esta design sheet marca a versão inicial aprovada do projeto **Hollow Crown**. Os elementos listados — Un1 como herói inicial, as 10 cartas, os 3 inimigos comuns, o Cavaleiro Cinzento como elite, a Slime Corrompida como primeiro chefe e as 5 relíquias — foram alinhados com a art director e servem como base de referência para arte, gameplay e implementação futura.

O tema adotado é **fantasia pixel art**, com sistema de recurso **Brasa** como mecânica central do herói inicial.
