const initState = {
  color: 'red',
};

const getters = {};

const actions = {
  getData({ commit, state }) {
    const { color = 'blue' } = state;
    if (color === 'blue') {
      commit('setState', 'red');
    } else {
      commit('setState', 'blue');
    }
  },
};

const mutations = {
  setState(state, staus) {
    const newState = state;
    newState.color = staus;
  },
};

export default {
  namespaced: true,
  state: initState,
  getters,
  actions,
  mutations,
};
