import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
var _excluded = ["item"];

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';
import Ref from './Ref';
import { isDefined } from './shared/utils';
import { isPdf } from './shared/propTypes';
export var OutlineItemInternal = /*#__PURE__*/function (_PureComponent) {
  _inherits(OutlineItemInternal, _PureComponent);

  var _super = _createSuper(OutlineItemInternal);

  function OutlineItemInternal() {
    var _this;

    _classCallCheck(this, OutlineItemInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "getDestination", function () {
      return new Promise(function (resolve, reject) {
        var _this$props = _this.props,
            item = _this$props.item,
            pdf = _this$props.pdf;

        if (!isDefined(_this.destination)) {
          if (typeof item.dest === 'string') {
            pdf.getDestination(item.dest).then(resolve)["catch"](reject);
          } else {
            resolve(item.dest);
          }
        }

        return _this.destination;
      }).then(function (destination) {
        _this.destination = destination;
        return destination;
      });
    });

    _defineProperty(_assertThisInitialized(_this), "getPageIndex", function () {
      return new Promise(function (resolve, reject) {
        var pdf = _this.props.pdf;

        if (isDefined(_this.pageIndex)) {
          resolve(_this.pageIndex);
        }

        _this.getDestination().then(function (destination) {
          if (!destination) {
            return;
          }

          var _destination = _slicedToArray(destination, 1),
              ref = _destination[0];

          pdf.getPageIndex(new Ref(ref)).then(resolve)["catch"](reject);
        });
      }).then(function (pageIndex) {
        _this.pageIndex = pageIndex;
        return _this.pageIndex;
      });
    });

    _defineProperty(_assertThisInitialized(_this), "getPageNumber", function () {
      return new Promise(function (resolve, reject) {
        if (isDefined(_this.pageNumber)) {
          resolve(_this.pageNumber);
        }

        _this.getPageIndex().then(function (pageIndex) {
          resolve(pageIndex + 1);
        })["catch"](reject);
      }).then(function (pageNumber) {
        _this.pageNumber = pageNumber;
        return pageNumber;
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onClick", function (event) {
      var onClick = _this.props.onClick;
      event.preventDefault();

      if (!onClick) {
        return false;
      }

      return Promise.all([_this.getDestination(), _this.getPageIndex(), _this.getPageNumber()]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 3),
            dest = _ref2[0],
            pageIndex = _ref2[1],
            pageNumber = _ref2[2];

        onClick({
          dest: dest,
          pageIndex: pageIndex,
          pageNumber: pageNumber
        });
      });
    });

    return _this;
  }

  _createClass(OutlineItemInternal, [{
    key: "renderSubitems",
    value: function renderSubitems() {
      var _this$props2 = this.props,
          item = _this$props2.item,
          otherProps = _objectWithoutProperties(_this$props2, _excluded);

      if (!item.items || !item.items.length) {
        return null;
      }

      var subitems = item.items;
      return /*#__PURE__*/React.createElement("ul", null, subitems.map(function (subitem, subitemIndex) {
        return /*#__PURE__*/React.createElement(OutlineItemInternal, _extends({
          key: typeof subitem.destination === 'string' ? subitem.destination : subitemIndex,
          item: subitem
        }, otherProps));
      }));
    }
  }, {
    key: "render",
    value: function render() {
      var item = this.props.item;
      return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
        href: "#",
        onClick: this.onClick
      }, item.title), this.renderSubitems());
    }
  }]);

  return OutlineItemInternal;
}(PureComponent);
var isDestination = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.any)]);
OutlineItemInternal.propTypes = {
  item: PropTypes.shape({
    dest: isDestination,
    items: PropTypes.arrayOf(PropTypes.shape({
      dest: isDestination,
      title: PropTypes.string
    })),
    title: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func,
  pdf: isPdf.isRequired
};

var OutlineItem = function OutlineItem(props) {
  return /*#__PURE__*/React.createElement(DocumentContext.Consumer, null, function (documentContext) {
    return /*#__PURE__*/React.createElement(OutlineContext.Consumer, null, function (outlineContext) {
      return /*#__PURE__*/React.createElement(OutlineItemInternal, _extends({}, documentContext, outlineContext, props));
    });
  });
};

export default OutlineItem;