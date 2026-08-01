---
layout: layouts/post.njk
title: "What T5 Adds Beyond Decoder-Only Polymer Models"
seoTitle: "T5 vs decoder-only polymer language models for molecular discovery"
summary: "A technical but accessible note on why encoder-decoder T5 architectures matter for polymer property prediction, conditional generation, molecule-text translation, and materials discovery workflows."
date: 2026-08-01T09:00:00-07:00
tags:
  - POLYT5
  - T5
  - polymer-language-models
  - generative-design
  - materials-informatics
---

Language models for molecules and polymers are often discussed as if the main question is scale: more data, more parameters, more generated candidates.

Scale helps, but architecture matters too.

This is especially true for polymers, where a string representation is not just a sequence of local tokens. A repeat unit contains connectivity, branch points, termini, ring patterns, side chains, heteroatoms, and sometimes property or processing context. A model that only learns to predict the next token from the tokens on its left can be very useful, but it is not always the most natural way to solve every polymer-design problem.

That is why T5-like encoder-decoder models are interesting for molecular and polymer discovery. T5 is not only a transformer model. It is a way of turning many tasks into the same text-to-text problem: read one sequence, generate another sequence.

For polymers, that gives a clean language for several tasks:

- polymer structure to property value
- polymer structure plus solvent to solubility label
- property target to polymer structure
- natural-language prompt plus chemical string to prediction
- corrupted polymer string to reconstructed polymer string
- reaction or synthesis context to product, yield, or design suggestion

POLYT5 is one example of this idea working in polymer design. But it is part of a broader trend. MolT5, Text+Chem T5, ReactionT5, PolyNC, PolyTAO, and newer adapter-based approaches such as ChemLML all point toward the same lesson: chemical discovery benefits when models can translate between representations, not just continue strings.

## Decoder-only models are powerful, but asymmetric

Decoder-only language models generate sequences autoregressively. At each step, the model predicts the next token from the tokens that came before it. This is a natural fit for open-ended generation, and it is one reason decoder-only models have become so widely used.

For molecule or polymer generation, a decoder-only model can learn the next likely token in a SMILES, SELFIES, BigSMILES, or related string. If it is trained well, it can generate many syntactically valid candidates and explore useful regions of chemical space. Decoder-only models also scale cleanly, which makes them attractive when the goal is broad pretraining.

The limitation is in the direction of information flow.

With causal masking, each token representation is built only from earlier tokens. That is not always a problem for generation, but it can be awkward when the model needs to understand a complete input before producing an output. Many scientific tasks are closer to translation than continuation. The model is not merely finishing a string; it is mapping one object to another.

For example:

- read a full polymer repeat unit and predict glass transition temperature
- read a target property and generate a valid polymer
- read a natural-language description and output a molecule
- read a polymer-solvent pair and classify solubility
- read reactants, reagents, catalysts, and products, then predict reaction yield

In these cases, we often want the model to build a representation of the whole input first. A decoder-only model can still be adapted by concatenating prompts, properties, and targets into one long sequence, but the input side is still processed under causal constraints unless special masking or prefix-LM variants are used.

That is the central architectural difference: decoder-only models are excellent sequence continuers, while T5 is built as a sequence mapper.

## What T5 changes

T5 uses an encoder-decoder transformer. The encoder reads the input sequence with fully visible attention, meaning each input-token representation can use information from the full input. The decoder then generates the output autoregressively, using both its previous output tokens and cross-attention to the encoder representation.

That separation is useful:

- the encoder can focus on understanding the complete input
- the decoder can focus on producing a valid output sequence
- cross-attention connects generated tokens to the relevant parts of the input
- prediction and generation can share the same text-to-text interface

The original T5 work by Raffel and co-workers showed that many language tasks could be rewritten into one format: text in, text out. For chemistry and materials discovery, that idea is powerful because many tasks that look different on the surface can be represented as sequence-to-sequence mappings.

The input text does not have to be ordinary English. It can be SMILES, SELFIES, PSELFIES, a property tag, a solvent string, a reaction role token, a target value, or a short natural-language instruction. The output can be a number, a class label, a caption, a reaction product, or a generated structure.

This is the practical value of T5: it gives a common modeling grammar for tasks that would otherwise be handled by separate models.

## Span corruption is more than masked tokens

The other important part of T5 is its pretraining objective.

Instead of training only by next-token prediction, T5 commonly uses a denoising objective called span corruption. A portion of the input is removed in short contiguous spans. Each removed span is replaced by a sentinel token, and the model is trained to reconstruct the missing spans in the decoder output.

For ordinary text, this teaches the model to recover missing phrases from surrounding context. For chemical strings, the analogy is useful: the model can learn to reconstruct missing fragments, local motifs, branch patterns, or repeat-unit segments from the rest of the structure.

This matters because chemistry is full of dependencies that are not purely left-to-right. A token can be important because of what comes after it. A side chain can change the interpretation of a nearby motif. A polymer repeat unit can be valid or invalid because of how the whole string fits together.

Span corruption pushes the model to use context from both directions during pretraining. For molecule and polymer discovery, that is a different learning signal from simply asking "what token comes next?"

## A broader family of T5-style chemical models

POLYT5 is not the only example where T5-style modeling helps. The broader literature is useful because each model highlights a different reason encoder-decoder architectures are attractive.

MolT5, developed by Edwards and co-workers, framed molecule captioning and text-guided molecule generation as translation tasks. A molecule can be translated into a natural-language description, and a description can be translated into a molecule. This was important because it showed that the text-to-text framework can connect chemical strings with human-readable language. MolT5 also emphasized evaluation: string similarity alone is not enough, so the paper considered fingerprint similarities, validity, and cross-modal metrics based on Text2Mol.

Text+Chem T5, introduced by Christofidellis and co-workers, pushed the idea further by training a multi-domain, multi-task model that handles natural language, chemistry, and cross-domain tasks in one framework. It is useful for this discussion because it shows that the value of T5 is not only molecule generation. The same model family can support molecule-to-text, text-to-molecule, forward reaction prediction, retrosynthesis, and procedure-related text tasks. The lesson is that shared text-to-text training can transfer information across tasks that would otherwise be isolated.

ReactionT5, proposed by Sagawa and Kojima, shows the same principle in reaction modeling. It uses T5 for reaction tasks by representing reactions as text with role-specific tokens such as reactant, reagent, solvent, catalyst, product, and yield. Its two-stage pretraining strategy first learns single-molecule structure and then continues on reaction data from the Open Reaction Database. The important point for materials informatics is the transfer-learning pattern: large public reaction data can make a model more useful when only a small target dataset is available.

PolyNC brings the story into polymer property prediction. It combines natural-language prompts with polymer SMILES and uses a T5 encoder-decoder model for regression and classification tasks. Instead of building separate heads for each property, the task is encoded in the prompt and the model outputs the requested value or class. That is a natural fit for polymer informatics, where many datasets are small and each property may have its own context.

PolyTAO moves toward reverse polymer design. It uses property information as input and polymer SMILES as output, making the model a property-to-structure generator. This is close to the design question many scientists actually want to ask: "given these desired properties, what polymer should I try?" PolyTAO is also a reminder that large structure-property corpora can support supervised generative pretraining, not only unsupervised reconstruction.

ChemLML adds an important caution. It does not simply train one large T5 model end to end. Instead, it links pretrained text encoders and molecule decoders using lightweight adapters. This matters because it asks a practical question: do we always need to retrain a complete multimodal T5-style model, or can we connect strong pretrained components? ChemLML also shows that the choice between SMILES and SELFIES is empirical. SELFIES gives stronger validity guarantees in principle, but in some text-guided molecule-generation settings, SMILES-based models performed better on similarity metrics. That does not mean SMILES is always better. It means representation choice should be validated for the actual task.

Taken together, these models show that T5 is not a single recipe. It is a flexible design pattern:

- use the encoder to read complete context
- use the decoder to generate the requested output
- use text-to-text prompts to unify tasks
- use domain-specific pretraining when the language is specialized

## What POLYT5 adds specifically

POLYT5 fits into this broader landscape as a polymer-native foundation model. Its goal was not only to fine-tune a general model on a downstream polymer dataset, but to first teach the model a large-scale polymer language.

In POLYT5, the base T5 model was trained on more than 100 million polymer structures represented in a polymer SELFIES-like notation. The pretraining task used span-masked reconstruction: the model sees a corrupted polymer sequence with sentinel tokens and learns to generate the missing spans. After that, the same base model can be fine-tuned for property prediction and conditional generation.

For property prediction, the input is a polymer representation, sometimes with task-specific context, and the output is a property value or label. For conditional generation, the input is a target property value and the output is a complete polymer structure.

That is the architecture-level reason POLYT5 is useful. It makes prediction and generation feel like two transfer-learning problems built on the same polymer-aware representation, rather than two unrelated workflows stitched together at the end.

The practical effect was visible in both tasks. Pretraining improved property prediction and made generation more robust. Without polymer-specific pretraining, generated strings were more likely to fail chemical or representation checks, especially as sampling became more exploratory. With pretraining, the model produced more valid candidates and was less sensitive to fine-tuning choices.

POLYT5 also adds something beyond the model itself: a complete design loop. In the high-temperature dielectric polymer case study, conditional generation was followed by validity filtering, property prediction, processability and solubility screening, synthesis, and experimental validation. That is important. A language model can propose candidates, but a materials-design workflow needs the rest of the scientific stack.

## Why this matters for polymer discovery

For someone thinking about using T5 in polymer discovery, the key advantages are practical.

First, T5 gives bidirectional input understanding. If the input is a polymer repeat unit, a property prompt, a solvent condition, or a reaction context, the encoder can represent the full input before the decoder generates an answer.

Second, T5 gives a unified interface. Regression, classification, captioning, reaction prediction, and generation can all be written as text-to-text tasks. This does not remove the need for careful task design, but it reduces the need to build a new architecture for every property.

Third, T5 supports conditional generation naturally. The condition can be a target property, a property range, a desired class, a solvent, a temperature, or a natural-language design instruction. The decoder then generates a structure conditioned on the encoded input.

Fourth, span corruption is well matched to chemical sequence learning. It encourages the model to learn missing motifs from surrounding context, which is closer to learning chemical grammar than plain next-token continuation.

Fifth, T5 supports transfer learning in low-data regimes. This is especially important in materials science, where labeled datasets are often small, heterogeneous, and expensive to produce. ReactionT5 makes this point clearly for reactions, PolyNC for polymer-property tasks, and POLYT5 for polymer property prediction and generation.

## The hard parts

T5 is not a magic wrapper around discovery. Most of the important decisions happen before and after the model.

The first challenge is representation. SMILES is common and compact, but polymer SMILES requires special handling of polymerization points. SELFIES improves validity for molecular strings, but polymers need additional conventions. POLYT5 used a polymer-adapted SELFIES representation with placeholder atoms for polymer termini. That works for many repeat-unit workflows, but it is not universal. More complex cases such as stochastic copolymers, crosslinked networks, sequence-defined polymers, branching distributions, or materials better described by BigSMILES may require different tokenization and new domain-adaptive pretraining.

The second challenge is tokenization. Character-level tokenization can be robust and simple, as PolyNC discusses, but it may split chemically meaningful groups into small pieces. Tokenizing SELFIES-style bracketed units preserves more chemical meaning, but the vocabulary and sequence lengths must be managed carefully. ReactionT5 also shows that token coverage matters: reaction data can contain atoms and role information that a molecule-only tokenizer may not handle well. There is no universally best tokenizer. It should be chosen with the representation, corpus size, and target tasks in mind.

The third challenge is data quality. A large unlabeled corpus can teach syntax and motifs, but property prediction depends on reliable target property values. For polymers, reported properties may vary with molecular weight, processing route, measurement temperature, frequency, humidity, solvent, crystallinity, or experimental protocol. If those conditions are missing, measurements made under different experimental contexts may be treated as if they describe the same material response. ChemLML makes a similar point for text-guided molecule generation: generic or ambiguous descriptions can make evaluation misleading.

The fourth challenge is prompt design. In a text-to-text model, the prompt is part of the experiment. The same polymer string can be paired with different property tags, units, or instructions. Prompts should be standardized, explicit, and tested so that results can be compared across datasets, model versions, and experiments.

The fifth challenge is generation control. Sampling temperature, top-p, beam search, and number of generated candidates all change the balance between novelty, validity, and duplication. In POLYT5, more exploratory sampling increased invalid outputs, while more restrictive sampling reduced invalid outputs but increased duplicates. MolT5 also showed that high-validity decoding can improve validity but may change other quality metrics. The best settings depend on whether the goal is broad exploration, high-confidence generation, or candidate refinement.

The sixth challenge is evaluation. Validity alone is not enough. A generated polymer can be syntactically valid and still be uninteresting, too similar to training data, difficult to synthesize, unstable, insoluble, or outside the target property range. A serious workflow should evaluate validity, uniqueness, novelty, nearest-neighbor similarity, property predictions, uncertainty, synthetic accessibility, and, whenever possible, experimental confirmation.

## A practical recipe

If I were starting a T5-based model for a new polymer discovery problem, I would begin with a disciplined workflow.

First, define the representation. Decide whether the task is best served by SMILES, SELFIES, PSELFIES, BigSMILES, graphs translated to strings, or a mixed representation. Do not choose only based on convenience. Choose based on what chemistry the model must preserve.

Second, build the tokenizer around the representation. If the representation has meaningful bracketed tokens, preserve them. If the dataset is small or highly varied, character-level tokenization may be safer. Reserve task-specific tokens for information the model must distinguish, such as property names, units, polymer endpoints, or reaction roles. For T5-style span corruption, also include the sentinel and padding tokens required during pretraining.

Third, pretrain before asking for downstream performance. Use a polymer- or molecule-specific corpus and a span-corruption objective. The goal is to teach the model chemical syntax, common motifs, and representation consistency before exposing it to smaller labeled datasets.

Fourth, write every downstream task as text-to-text. A property-prediction example might map `polymer: [PSELFIES] property: Tg` to `423.0 K`. A generation example might map `target Tg: 500 K` to a polymer string. A solubility example might map `polymer: [PSELFIES] solvent: water` to `soluble` or `insoluble`.

Fifth, start with one property before moving to multi-property generation. Single-property conditioning is easier to debug. Multi-property generation is more realistic, but it requires jointly labeled data or a careful combination of generation and post-generation screening.

Sixth, use conservative validation from the beginning. Decode every generated sequence. Check chemical validity. Check polymer endpoints. Remove duplicates. Compare against the training set. Track failure modes, not only successful examples.

Seventh, compare against strong baselines. T5 should be tested against descriptor models, graph neural networks, encoder-only models, decoder-only models, adapter-linked models, and simpler sequence models when appropriate. The goal is not to declare one architecture universally best. The goal is to know what each architecture gives for the task at hand.

## When I would still use decoder-only models

This post is not an argument that decoder-only models are bad for chemistry or polymers.

If the goal is large-scale unconditional generation, interactive completion, or learning from extremely large mixed text and chemistry corpora, decoder-only models can be very attractive. They are simple to scale and align well with next-token generation.

But when the task requires reading a complete structured input and producing a different structured output, T5 has a cleaner inductive bias. It separates input representation from output generation. That makes it especially natural for property prediction, conditional generation, prompt-conditioned tasks, reaction tasks, and workflows where the model must connect natural language, chemical strings, and property values.

## The main takeaway

For polymer discovery, T5 adds a useful modeling philosophy: make the scientific task a sequence-to-sequence mapping.

The encoder reads the full scientific context. The decoder generates the requested answer. Pretraining teaches the model the grammar of chemical or polymer structures before fine-tuning teaches it specific property relationships.

That is why T5 is important for POLYT5, but POLYT5 is not the only reason to care. MolT5 shows molecule-language translation. Text+Chem T5 shows multi-domain, multi-task learning. ReactionT5 shows reaction-domain transfer learning from large public data. PolyNC shows prompt-based polymer property prediction. PolyTAO shows property-conditioned polymer generation. ChemLML shows that adapter-based combinations of pretrained text and molecule models can be a practical alternative.

The better question is not simply whether we should use encoder-decoder or decoder-only architectures. The better question is: what information must the model understand before it generates?

If the model must consider the molecular or polymer structure, the task prompt, and the property condition before generating an output, then T5 deserves serious attention.

## References

1. Raffel et al., [Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer](https://arxiv.org/abs/1910.10683), JMLR, 2020.
2. Edwards et al., [Translation between Molecules and Natural Language](https://arxiv.org/abs/2204.11817), 2022.
3. Christofidellis et al., [Unifying Molecular and Textual Representations via Multi-task Language Modelling](https://arxiv.org/abs/2301.12586), ICML, 2023.
4. Sagawa and Kojima, [ReactionT5: a large-scale pre-trained model towards application of limited reaction data](https://arxiv.org/abs/2311.06708), 2023.
5. Qiu et al., [PolyNC: a natural and chemical language model for the prediction of unified polymer properties](https://doi.org/10.1039/D3SC05079C), Chemical Science, 2024.
6. Qiu et al., [On-demand reverse design of polymers with PolyTAO](https://doi.org/10.1038/s41524-024-01466-5), npj Computational Materials, 2024.
7. Sahu et al., [POLYT5: an encoder-decoder foundation chemical language model for generative polymer design](https://doi.org/10.1038/s44387-026-00087-1), npj Artificial Intelligence, 2026.
8. Deng et al., [Chemical Language Model Linker: blending text and molecules with modular adapters](https://arxiv.org/abs/2410.20182), 2025.
