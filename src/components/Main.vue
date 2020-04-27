<template>
  <div v-if="pdata" class="container">
	  <div v-if="errorMsg" class="error">{{errorMsg}}</div>
	  <div class="exp">
		<div>
	  		<button v-if="connector" @click="performActions" class="btn">Execute</button><br />
	  	    <button v-if="connector" @click="reset" class="btn">Reset</button>
			<div v-if="connector && connector.isSaving" class="exp-saving">Saving...</div>
		</div>
		<div>
			<h1>{{pdata.name}}</h1>
			<ul>
			  <li v-for="experiment in pdata.experiments">
				  <div class="exp-title">{{experiment.title}}
					  <span class="exp-rating" :class="ratingDisplay(experiment.rating)"></span>
				  </div>
				  <div class="exp-desc">{{experiment.description}}</div>
			  </li>
			</ul>
		</div>
		<div>
			<h1>Researchers</h1>
			<ul>
			  <li v-for="researcher in pdata.researchers">
				  <div class="exp-title">{{researcher.name}}</div>
			  </li>
			</ul>
		</div>
		<div>
			<h1>Reviews</h1>
			<ul>
			  <li v-for="review in pdata.reviews">
				  <div class="exp-title">{{researcherById(review.researcherId).name}} gave '{{ experimentById(review.experimentId).title }}' a score of {{review.score}}.</div>
			  </li>
			</ul>
		</div>
	  </div>
  </div>
  <div v-else>
	  Loading...
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import axios from 'axios';
import APIConfig from '../connect/APIConfig';
import Connector from '../connect/Connector';

@Component
export default class Main extends Vue {
  private pdata: any = {};
  private errorMsg = '';
  private connector: Connector|null = null;
  private executed = false;
  @Prop({type: APIConfig, required: true}) readonly apiConfig!: APIConfig;
  
  experimentById(id: number) {
	  return this.pdata.experiments.find((o: any) => o.id === id);
  }

  researcherById(id: number) {
	  return this.pdata.researchers.find((o: any) => o.id === id);
  }
  
  ratingDisplay(rating: number) {
  	  if (rating >= 8) {
  	  	  return 'excellent';
  	  } else if (rating >= 6.5) {
  	  	  return 'good';
  	  } else if (rating > 4) {
  	  	  return 'moderate';
  	  } else {
		  return 'bad';
  	  }
  }
  
  mounted() {
	  this.connector = new Connector(this.apiConfig);
	  this.reset();
  }
  
  async load() {
	  if (!this.connector) { return; }
	  this.pdata = await this.connector.load();
  }
  
  async reset() {
	  if (!this.connector) { return; }
	  const status = await this.connector.reset();
  	  if (status === 'OK') {
  		  this.load();
  		  this.errorMsg = '';
	  	  this.executed = false;
  	  } else {
  		  this.errorMsg = 'Oh no, something unexpected happened!';
  	  }
  }
  
  async performActions() {
	  if (!this.connector) { return; }
	  this.connector.addResearcher('Sarah');
	  this.connector.addResearcher('Gramps');
	  this.connector.updateReview(2, 1, 9);
	  this.connector.addExperiment('Next Set Demo 1', '', 4);
	  this.connector.addReview(3, 1, 6);
	  this.connector.updateExperimentTitle(3, 'Failed experiment no 3');
	  this.connector.updateExperimentRating(3, 5);
	  this.connector.addReview(4, 3, 3);
	  this.connector.addReview(4, 1, 2);
	  this.connector.addReview(3, 2, 6.5);
	  this.connector.addReview(4, 4, 4);
	  await this.connector.updateExperimentRating(1, 6.5);
	  this.load();
  	  this.executed = true;
  }
}
</script>

<style>
html {
	font-size: 10px;
}
body {
	font-size: 1.3rem;
	background-color: #ededed;
}
.container {
	margin: 0 auto;
	width: 960px;
}
.exp {
	display: flex;
	justify-content: space-evenly;
}
.btn {
	font-size: 1.5rem;
	border: 1px solid transparent;
	border-radius: 3px;
	background-color: #b1dbc0;
	margin-top: 1em;
	margin-right: .75em;
	padding: .3em .7em;
	cursor: pointer;
}
.btn:hover {
	background-color: #88c89f;
}
h1 {
	font-size: 1.6rem;
}
ul {
	list-style: none;
	padding: 0;
}
li {
	margin-bottom: 1em;
}
.exp-title {
	font-size: 1.4rem;
	font-weight: 500;
}
.exp-desc {
	font-size: 1.3rem;
}
.exp-rating {
	display: inline-block;
	width: 20px;
	height: 12px;
	border: 1px solid #999;
	margin-left: 5px;
}
.exp-saving {
	margin-top: 1em;
}
.excellent {
	background-color: limegreen;
}
.good {
	background-color: orange;
}
.moderate {
	background-color: #ffdd00;
}
.bad {
	background-color: red;
}
.error {
	color: red;
	margin-top: .5em;
}
</style>
