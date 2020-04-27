<template>
  <div id="app">
    <Main :api-config="apiConfig"></Main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import APIConfig from './connect/APIConfig';
import Main from './components/Main.vue';

const HOST_URL = 'http://localhost:3000';

@Component({
  components: {
    Main,
  },
})
export default class App extends Vue {
	private readonly apiConfig: APIConfig = APIConfig.from({
		loadURL: `${HOST_URL}/experiments`,
		resetURL: `${HOST_URL}/reset`,
		addResearcherURL: `${HOST_URL}/researcher-add`,
		addExperimentURL: `${HOST_URL}/experiment-add`,
		addReviewURL: `${HOST_URL}/review-add`,
		updateExperimentTitleURL: `${HOST_URL}/experiment-update-title`,
		updateExperimentRatingURL: `${HOST_URL}/experiment-update-rating`,
		updateReviewURL: `${HOST_URL}/review-update`
	});
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 10px;
}
</style>
