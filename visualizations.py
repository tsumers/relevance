import numpy as np
import seaborn as sns
import matplotlib.pylab as plt
from matplotlib.ticker import FuncFormatter

SB_DEFAULT_REWARDS = {"green": 2, "red": 0,  "blue": -2, "circle": 1, "triangle": 0, "square": -1}

def heatmap_speaker_action_dataframe(full_utterance_probabilities_df, speaker_one, rewards, speaker_one_col=None, speaker_two=None, vmax=None,
                                     vmin=None, cmap="Purples"):
    """Visualize the probability of a speaker choosing an utterance."""

    plt.figure()
    collapsed_df = full_utterance_probabilities_df.groupby(["value", "feature"]).agg(np.mean).reset_index()

    collapsed_df["label"] = collapsed_df.truthful.apply(lambda x: "X" if x else "")

    if speaker_one_col is None:
        speaker_one_col = speaker_one.name + "_prob"

    if speaker_two is None:
        to_plot_col = speaker_one_col
        title = "Utterance Probabilities for {} Speaker".format(speaker_one.name)
    else:
        cmap = "PuOr_r"
        title = "Difference in Probabilities: {} (gold) vs {} (purple)".format(speaker_one.name, speaker_two.name)
        collapsed_df["speaker_diff"] = collapsed_df[speaker_one_col] - collapsed_df[speaker_two.name + "_prob"]
        to_plot_col = "speaker_diff"

    utterance_selection = collapsed_df.pivot("value", "feature", to_plot_col)
    labels = collapsed_df.pivot("value", "feature", "label")

    # Sort columns in descending order of features
    features_in_descending_order = rewards[utterance_selection.columns].sort_values(ascending=False).index
    utterance_selection = utterance_selection.reindex(features_in_descending_order, axis=1)
    labels = labels.reindex(features_in_descending_order, axis=1)

    if vmax is None:
        vmax = collapsed_df[to_plot_col].max()
    if vmin is None:
        vmin = collapsed_df[to_plot_col].min()

    formatter = FuncFormatter(_format_positive)
    ax = sns.heatmap(utterance_selection, annot=labels, fmt='', linewidths=.3, cmap=cmap, vmin=vmin, vmax=vmax,
                     cbar_kws={'format': formatter}, linecolor='lightgray')

    ax.invert_yaxis()
    plt.title(title)


def _format_positive(x, pos):

    return '%0.2f' % abs(x)


def plot_action_df(action_df):
    """Take a pandas DataFrame representing a bandit config and plot it."""

    plt.figure(figsize=(len(action_df), 3))

    shapes = [_plt_markers(label) for label in action_df.index]
    colors = [_plt_colors(label) for label in action_df.index]
    x_vals = range(0, len(action_df))

    for _s, _c, _x, _y in zip(shapes, colors, x_vals, action_df.true_rewards):
        plt.scatter(_x, _y, marker=_s, c=_c, s=300, zorder=2)

    for x_line in [-3, -2, -1, 1, 2, 3]:
        plt.axhline(x_line, linestyle='--', alpha=.2, zorder=1, c='k')
    plt.axhline(0, linestyle='--', alpha=.8, zorder=1, c='k')

    plt.gca().set_xticks([])
    plt.suptitle("Decision Values")
    plt.xlim(-.25, len(action_df) - .75)

    plt.ylim(-3.5, 3.5)


def plot_color_string(color_string, reward_dict=None, alpha=1, title="Decision Values", ax=None):
    """Take a string representing a set of actions and plot it."""

    if reward_dict is None:
        reward_dict = SB_DEFAULT_REWARDS

    split_string = color_string.split("'")
    shapes = []
    colors = []
    rewards = []
    for i in [1, 3, 5]:
        color, shape = split_string[i].split()
        rewards.append(reward_dict[color] + reward_dict[shape])
        colors.append(color)
        shapes.append(shape)

    if ax is None:
        ax = plt.figure(figsize=(len(shapes)/1.5, 2)).gca()

    shapes = [_plt_markers(label) for label in shapes]
    colors = [_plt_colors(label) for label in colors]
    x_vals = range(0, int(len(shapes)))

    for _s, _c, _x, _y in zip(shapes, colors, x_vals, rewards):
        ax.scatter(_x, _y, marker=_s, c=_c, s=300, zorder=2, alpha=alpha)

    for x_line in [-3, -2, -1, 1, 2, 3]:
        ax.axhline(x_line, linestyle='--', alpha=.2, zorder=1, c='k')
    ax.axhline(0, linestyle='--', alpha=.8, zorder=1, c='k')

    ax.set_xticks([])
    ax.set_title(title, wrap=True)

    ax.set_xlim(-.25, len(shapes) - .75)
    ax.set_ylim(-3.5, 3.5)


def _plt_markers(feature_string):
    if len(feature_string.split()) > 1:
        feature_string = feature_string.split()[1]

    mapping = {"square": "s",
               "circle": "o",
               "triangle": "^"}

    return mapping.get(feature_string, "*")


def _plt_colors(feature_string):
    if len(feature_string.split()) > 1:
        feature_string = feature_string.split()[0]

    if feature_string in ["red", "green", "blue"]:
        return feature_string
    else:
        return 'black'
