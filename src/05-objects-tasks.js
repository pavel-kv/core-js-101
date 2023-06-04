/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */


class SelectorBuilderClass {
  constructor() {
    this.selectors = [];
    this.combineSelectors = [];
    this.flags = {
      element: false,
      id: false,
      pseudoElement: false,
    };
    this.order = ['element', 'id', 'class', 'attribute', 'pseudoClass', 'pseudoElement'];
  }

  element(value) {
    if (this.flags.element) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }

    this.flags.element = true;
    this.selectors.push({ type: 'element', value: `${value}` });
    this.checkOrder();
    return this;
  }

  id(value) {
    if (this.flags.id) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }

    this.flags.id = true;
    this.selectors.push({ type: 'id', value: `#${value}` });
    this.checkOrder();
    return this;
  }

  class(value) {
    this.selectors.push({ type: 'class', value: `.${value}` });
    this.checkOrder();
    return this;
  }

  attr(value) {
    this.selectors.push({ type: 'attribute', value: `[${value}]` });
    this.checkOrder();
    return this;
  }

  pseudoClass(value) {
    this.selectors.push({ type: 'pseudoClass', value: `:${value}` });
    this.checkOrder();
    return this;
  }

  pseudoElement(value) {
    if (this.flags.pseudoElement) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }

    this.flags.pseudoElement = true;
    this.selectors.push({ type: 'pseudoElement', value: `::${value}` });
    return this;
  }

  checkOrder() {
    const isValidOrder = this.selectors.every((selector, index) => {
      const indexInOrder = this.order.indexOf(selector.type);
      const selectors = this.selectors.slice(0, index);
      return selectors.every((elem) => {
        const result = !this.order.slice(indexInOrder + 1).includes(elem.type);
        return result;
      });
    });

    if (!isValidOrder) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    return true;
  }

  combine(selector1, combinator, selector2) {
    this.combineSelectors.push(selector1.stringify());
    this.combineSelectors.push(` ${combinator} `);
    this.combineSelectors.push(selector2.stringify());
    return this;
  }

  stringify() {
    let selector = null;
    if (this.selectors.length) {
      selector = this.selectors.map((item) => item.value).join('');
    } else if (this.combineSelectors.length) {
      selector = this.combineSelectors.join('');
    }
    this.selectors = [];
    this.combineSelectors = [];
    return selector;
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new SelectorBuilderClass().element(value);
  },

  id(value) {
    return new SelectorBuilderClass().id(value);
  },

  class(value) {
    return new SelectorBuilderClass().class(value);
  },

  attr(value) {
    return new SelectorBuilderClass().attr(value);
  },

  pseudoClass(value) {
    return new SelectorBuilderClass().pseudoClass(value);
  },

  pseudoElement(value) {
    return new SelectorBuilderClass().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new SelectorBuilderClass().combine(selector1, combinator, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
