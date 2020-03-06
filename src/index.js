import React from "react";
import { render } from "react-dom";
import _ from "lodash/fp";
import Fuse from "fuse.js";

// User R.assoc and R.over to get nested data
const data = [
  {
    name: "Chinese",
    recipes: [
      {
        name: "Shanghai Noodle Soup",
        ingredients: [
          "noodles",
          "white pepper",
          "shrimp",
          "pork",
          "bamboo shoots"
        ]
      },
      {
        name: "Twice Cooked Pork",
        ingredients: ["pork", "black bean sauce"]
      },
      {
        name: "Mapo Tofu",
        ingredients: ["tofu", "black bean sauce", "pork"]
      }
    ]
  },
  {
    name: "Korean",
    recipes: [
      {
        name: "Kimchi Fried Rice",
        ingredients: ["kimchi", "rice", "egg", "spam", "corn", "peas"]
      },
      {
        name: "Army Stew",
        ingredients: ["kimchi", "rice", "egg", "spam", "corn", "peas"]
      }
    ]
  },
  {
    name: "Italian",
    recipes: [
      {
        name: "Pasta",
        ingredients: ["ipod", "iphone", "apple"]
      }
    ]
  },
  {
    name: "Mediterranean",
    recipes: [
      {
        name: "Green",
        ingredients: ["paiting", "nature", "rain"]
      }
    ]
  },
  {
    name: "American",
    recipes: [
      {
        name: "Fennel Crusted Lamb",
        ingredients: ["lamb", "fennel", "parsley", "parmesan"]
      }
    ]
  }
];

class App extends React.Component {
  state = {
    searchVal: "",
    data: data
  };
  someCounter = 100;

  fuse(e, y) {
    const nested =
      y === 2
        ? [
            { name: "recipes.name", weight: 0.4 },
            { name: "recipes.ingredients", weight: 0.3 }
          ]
        : [{ name: "name", weight: 0.4 }, { name: "ingredients", weight: 0.2 }];
    const threshhold = y === 2 ? 0.3 : 0.3;
    // 2 means it is nested
    var opts = {
      shouldSort: true,
      threshold: threshhold,
      keys: nested
    };
    var fuse = new Fuse(e, opts);
    var res = fuse.search(this.state.searchVal);
    return res;
  }

  nestedUniq(e) {
    const res = _.flow(
      _.flatMap("recipes"),
      _.values(),
      _.uniqBy("name")
    )(e);
    // THIS will cause an issue IF have two sub-tags with the same name (differing vals). Is this a super rare case? Orange and Orange?
    // COULD do uniqueBy vals instead?
    // const err = _.flow(_.flatMap("recipes"), _.values(), _.uniqBy("name"))(e)
    // res.forEach(el => { el.clickOrder = this.someCounter++})
    // console.log("err", res);
    return res;
  }
  render() {
    const { searchVal, data } = this.state;
    const searchOn = searchVal.length > 0;

    let output1;
    let output2;

    if (searchOn && this.fuse(data).length > 0) {
      output1 = this.fuse(data);
      output2 = this.fuse(data)
        .filter(e => this.fuse(data))
        .map(r => r.recipes)[0];
    } else if (searchOn && this.fuse(data, 2).length > 0) {
      output1 = this.fuse(data, 2);
      output2 = this.fuse(this.nestedUniq(data, 2));
    } else if (
      searchOn &&
      this.fuse(data, 2).length === 0 &&
      this.fuse(data).length === 0
    ) {
      output1 = [{ name: "No Results!" }];
      output2 = [{ name: "No Results!" }];
    } else {
      // data.forEach(el => { el.clickOrder = this.someCounter++*30 })
      output1 = data;
      output2 = this.nestedUniq(data);
    }

    return (
      <div>
        <div class="row">
          <input onChange={e => this.setState({ searchVal: e.target.value })} />
          <br />
          {output1.map(x => {
            return <span key={x.name}>{x.name} </span>;
          })}
          <br />
          {output2.map((x, idx) => {
            if (x.name != "No Results!") {
              return (
                <div class="card col s12 m5">
                  <div class="card-image waves-effect waves-block waves-light">
                    <img
                      class="activator"
                      src="https://materializecss.com/images/office.jpg"
                    />
                  </div>
                  <div class="card-content">
                    <span class="card-title activator grey-text text-darken-4">
                      <span key={idx}>{x.name} </span>
                      <i class="material-icons right">more_vert</i>
                    </span>
                  </div>
                  <div class="card-reveal">
                    <span class="card-title grey-text text-darken-4">
                      {x.name}
                      <i class="material-icons right">close</i>
                    </span>

                    {x.ingredients.map((y, idx) => {
                      return <li>{y}</li>;
                    })}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
