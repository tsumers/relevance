import itertools
import pandas as pd
from scipy.special import softmax

from listeners import StatelessLiteralListener


def generate_actions_from_features(*features):
    """Return a list of all possible shape-color pairs."""

    return list(itertools.product(*features))


def generate_context_from_actions(action_tuples):
    """Given a list of action-tuples, return a dataframe where columns are features of those actions."""

    action_records = []
    action_names = []
    for action in action_tuples:
        action_records.append({f: 1 for f in action})
        action_names.append(" ".join([f for f in action]))

    df = pd.DataFrame.from_records(action_records, index=action_names)

    return df.fillna(0)


def generate_worlds_from_feature_values(features, possible_values):
    """Given lists of features and values, generate a dataframe with all possible feature-value combinations."""

    worlds_list = []

    for f in features:
        if not worlds_list:
            worlds_list = [{f: k} for k in possible_values]
        else:
            worlds_list = [dict(**w, **{f: k}) for w in worlds_list for k in possible_values]

    return pd.DataFrame.from_records(worlds_list)


def generate_worlds_without_replacement(features, possible_values):
    """Given lists of features and values, generate a dataframe with all possible feature-value combinations."""

    worlds_list = []

    value_orderings = list(itertools.permutations(possible_values, len(possible_values)))
    for possible_world in value_orderings:
        worlds_list.append({f: v for f, v in zip(features, possible_world)})

    return pd.DataFrame.from_records(worlds_list)


sim_to_exp_stimulus = {
    "red": "Red",
    "blue": "Blue",
    "green": "Green",
    "circle": "Spotted",
    "triangle": "Solid",
    "square": "Striped"
}


def to_experiment_action_context_format(action_context_string):

    # Canonical mapping of shapes-to-texture
    split_string = action_context_string.split("'")
    actions = []
    for i in [1, 3, 5]:
        color, shape = split_string[i].split()
        actions.append({
            "color": sim_to_exp_stimulus[color],
            "texture": sim_to_exp_stimulus[shape]
        })
    return actions


def to_experiment_trial(action_contexts, features="all", values="all", trial_type="select"):

    contexts = map(to_experiment_action_context_format, action_contexts)
    trial_dict = {"action_context": list(contexts),
                  "features": [sim_to_exp_stimulus[x] for x in features],
                  "values": values,
                  "trial_type": trial_type}

    return trial_dict



def speakers_utterance_probabilities_single_action_context(action_context, speaker_list, utterance_list, w, listener=None):
    """Given an action context, return speaker probabilities and outcomes for each utterance."""

    if listener is None:
        listener = speaker_list[0]

    utterance_results = []
    for u in utterance_list:

        truthful_utterance = bool(w[u[0]] == u[1])

        # Basic utterance information: contents, truthfulness
        individual_utterance = {"utterance": u,
                                "feature": u[0],
                                "value": u[1],
                                "truthful": truthful_utterance,
                                "expected_rewards": listener.expected_rewards(u, action_context),
                                "prob_optimal_action": listener.probability_optimal_action(u, action_context)}

        for speaker in speaker_list:
            individual_utterance[speaker.name] = speaker.utility(u, action_context)

        utterance_results.append(individual_utterance)

    utterance_utility_dataframe = pd.DataFrame.from_records(utterance_results)
    for s in speaker_list:
        speaker_name = s.name
        utterance_utility_dataframe[speaker_name + "_prob"] = softmax(utterance_utility_dataframe[s.name] * s.beta)

    return utterance_utility_dataframe


def speaker_utterance_probabilities_multiple_action_contexts(action_context_tuples, speaker_list, utterance_list, w, listener=None):
    """Given a world configuration, generate speaker utterance probabilities over action sets."""

    # Iterate over all possible action sets and return results
    all_results = []
    for action_tuples in action_context_tuples:
        action_context = generate_context_from_actions(action_tuples)
        action_tuple_results = speakers_utterance_probabilities_single_action_context(action_context, speaker_list,
                                                                                      utterance_list, w,  listener=listener)
        action_tuple_results.loc[:, "action_context"] = str(action_context.index.values)

        rewards = StatelessLiteralListener.estimate_rewards(w, action_context)
        action_tuple_results.loc[:, "no_utterance_rewards"] = rewards.mean()

        all_results.append(action_tuple_results)

    results_df = pd.concat(all_results)

    return results_df


def summarize_speakers_performance(speaker_action_df, speaker_list):
    speaker_bandit_list = []

    if "action_context" not in speaker_action_df.columns:
        speaker_action_df["action_context"] = "All"

    grouped_by_bandit = speaker_action_df.groupby(["action_context"])

    for k, g in grouped_by_bandit:
        for s in speaker_list:
            speaker_col = "{}_prob".format(s.name)

            speaker_summary = {"speaker": s.name,
                               "action_context": k,
                               "prob_truthful": g[g.truthful][speaker_col].sum(),
                               "prob_optimal_action": (g.prob_optimal_action * g[speaker_col]).sum(),
                               "expected_rewards": (g.expected_rewards * g[speaker_col]).sum()}

            speaker_bandit_list.append(speaker_summary)

    return pd.DataFrame.from_records(speaker_bandit_list)
