---
layout: layouts/post.njk
title: "Hardness Prediction Needs the Load"
summary: "A note on our Applied Physics A paper showing why load-dependent experimental data can matter more than DFT-derived hardness proxies for Vickers hardness prediction."
date: 2026-07-17T20:30:00-07:00
tags:
  - hardness
  - machine-learning
  - gaussian-process-regression
  - materials-informatics
---

Hardness looks like a simple materials property until you try to model it carefully.

For many materials-design workflows, hardness is treated as something attached to a composition or crystal structure. Build a descriptor, train a model, predict hardness, screen candidates. That is a useful starting point, but it hides a very practical detail: measured hardness depends strongly on how the measurement is made.

In Vickers hardness testing, the indentation load is not a minor experimental footnote. It can change the reported hardness substantially because the measured value often shifts as the applied force changes. Two measurements made at different loads can therefore probe different deformation volumes and different points on the load-hardness response curve.

That is the motivation behind our recent paper, [Load-dependent hardness prediction for materials using machine learning](https://doi.org/10.1007/s00339-026-09913-4), published in *Applied Physics A*.

## Why load matters

A common route for computational hardness screening is to start from elastic properties, often bulk modulus and shear modulus from DFT, and then use semiempirical relationships to estimate hardness. Those relationships are attractive because elastic tensors are much easier to compute at scale than plastic deformation or indentation response.

But hardness is not only an elastic property.

The actual experimental value reflects deformation, defects, microstructure, processing history, and measurement conditions. In this paper, we focus on indentation load as one important measurement condition that should be included explicitly in the model. The same material can show noticeably different hardness values as load changes, and those changes are not captured by hardness proxies derived only from bulk and shear moduli.

So the modeling question becomes more specific: can we predict experimental Vickers hardness if the load is treated as part of the input, rather than something averaged away?

## What we built

We curated a load-dependent experimental Vickers hardness dataset with 2,480 unique records spanning 69 elements and 514 distinct chemical systems. Each record includes the material composition and the indentation load associated with the reported hardness measurement.

The model uses compositional, electronic, and structural descriptors along with the applied load. We trained Gaussian Process Regression models because GPR is well suited for moderately sized materials datasets and gives uncertainty estimates along with predictions.

The comparison we cared about was not just "does machine learning work?" A more interesting question was whether adding DFT-derived hardness estimates helps.

To test that, we compared:

1. A single-task GPR model trained only on experimental hardness data.
2. Multi-task GPR models that combine experimental hardness with computed hardness values from five semiempirical elastic-modulus-based formulas.

The result was clearer than I expected: the single-task model trained on experimental data performed best. Adding computed hardness proxies did not improve the prediction, and in some cases made the model worse.

## What this says about proxies

DFT-derived elastic properties are still very valuable. They are often the best high-throughput quantities we can compute for large materials spaces. But this work is a useful reminder that a convenient proxy is not always useful for every target.

For hardness, elastic-modulus-based estimates can miss important parts of the measurement. They usually assume idealized structures, ignore microstructure, and do not include indentation load. If those proxy values are then mixed into a learning problem, the model can inherit their limitations.

That does not mean theory is unhelpful. It means we should be careful about when a computed quantity is acting as a physical signal and when it is acting as a biased shortcut.

In this case, high-quality experimental data with the correct measurement context was more useful than expanding the dataset with proxy labels.

## The modeling habit I like

The part I find most useful is the modeling habit behind the paper.

Instead of treating all measurement variability as random noise, we ask whether some of it comes from known experimental conditions. Indentation load is one such condition. Once it is included explicitly, the model has a better chance of learning the load-dependent hardness response.

That idea applies beyond hardness. Many materials properties depend on measurement conditions:

- temperature for transport and mechanical properties
- frequency for dielectric response
- humidity or solvent environment for stability and swelling
- strain rate for mechanical behavior
- processing route for microstructure-sensitive properties

If those conditions are missing, the model may look noisy even when the underlying physics is more organized than the dataset suggests.

## What comes next

For future work, the most exciting direction is to make hardness modeling more connected to real materials-design decisions.

Hardness alone is rarely the whole objective. A useful structural material also has to balance toughness, ductility, density, oxidation resistance, processability, and cost. Load-dependent hardness prediction is one part of that larger picture, but it is an important part because it makes the property definition more honest.

This paper also points toward better dataset practices. If we want models that can guide experiments, we need to preserve measurement context: load, temperature, processing, microstructure, uncertainty, and any other condition that changes the reported value.

For me, the main lesson is simple: materials informatics is not only about better algorithms. It is also about asking the model the right version of the materials question.

Read the paper: [Load-dependent hardness prediction for materials using machine learning](https://doi.org/10.1007/s00339-026-09913-4).

Data and calculated hardness values are available through [polyVERSE](https://github.com/Ramprasad-Group/polyVERSE).
