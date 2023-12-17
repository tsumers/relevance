<img src="https://user-images.githubusercontent.com/4450850/193468608-beae10fc-d8f4-48ab-8051-1e948f0428cf.png" alt="Cover Image" width="600"/>

# Reconciling truthfulness and relevance as epistemic and decision-theoretic utility

This repository contains code and data to support the paper `Reconciling truthfulness and relevance as epistemic and decision-theoretic utility`.

# Data

Anonymized response data can be found in the `experiment/raw-exp-data/` folder. The `.csv` files there are the starting point for the analysis pipeline. The two experiment analysis notebooks, `exp1-analysis.ipynb` and `exp2-analysis.ipynb`, apply exclusion criteria as described in the paper and reformat the data to more manageable Pandas dataframes.

# Experiment and Models

The experiment itself is hosted at https://signaling-bandits.herokuapp.com/

The Psiturk / JsPsych code used for the experiment, as well as WebPPL models used for parameter inference, can be found in the `javascript/` directory. The most important files are:

`javascript/analysis/models.webppl`: this file contains the WebPPL implementation of all models used for parameter inference in the paper.

`javascript/static/js/`: this folder contains the Javascript experiment code. `experiment.js` is the main file.

Deploying the experiment on Prolific is fairly straightforward. The original experiment was forked from this repository, so you should be able to follow the `README.md` there to host your own version.

https://github.com/fredcallaway/heroku-experiment

# Analysis Notebooks

Experiment analysis code is a mix of Python, Javascript, and R.

The best starting point are the four included Jupyter notebooks:

-  `simulations.ipynb`: used to generate speaker simulation plots (Fig. 1) and model predictions for variance-explained plots (Fig. 3).
- `exp1-analysis.ipynb` and `exp2-analysis.ipynb`: used to load and analyze participant response data from the experiment. These notebooks export the data for WebPPL parameter inference, then load the resulting MLEs back in to generate experiment analysis plots (Figs. 2 and 4).
- `webppl-analysis.ipynb`: this notebook is used to launch WebPPL analyses. It loads the prepared experimental outputs, runs parameter inference, and then analyzes the results.

To load and explore the data yourself, first install the environment via Conda:
```
$ conda env create -f jupyter.yml
$ conda activate jupyter
$ jupyter lab
```

Note that only the raw input data is included in the GitHub (e.g. the `experiment/raw-exp-data/` folder). In order to replicate all of the experimental plots, you should load and run the notebooks in the following sequence: `simulations.ipynb`, `exp1-analysis.ipynb`/`exp2-analysis.ipynb`, and finally `webppl-analysis.ipynb`. Then you can go back to the  `exp1-analysis.ipynb`/`exp2-analysis.ipynb` notebooks and re-run them; they will load all of WebPPL outputs and produce the final versions of the figures shown in the paper.


If you want run the included tests:
```
$ python -m unittest
```
