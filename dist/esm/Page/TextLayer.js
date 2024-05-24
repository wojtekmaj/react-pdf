import _extends from "@babel/runtime/helpers/esm/extends";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import PageContext from '../PageContext';
import TextLayerItem from './TextLayerItem';
import { cancelRunningTask } from '../shared/utils';
import { isPage, isRotate } from '../shared/propTypes';
export var TextLayerInternal = /*#__PURE__*/function (_PureComponent) {
  _inherits(TextLayerInternal, _PureComponent);

  var _super = _createSuper(TextLayerInternal);

  function TextLayerInternal() {
    var _this;

    _classCallCheck(this, TextLayerInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "state", {
      textItems: null
    });

    _defineProperty(_assertThisInitialized(_this), "loadTextItems", function () {
      var page = _this.props.page;
      var cancellable = makeCancellable(page.getTextContent());
      _this.runningTask = cancellable;
      cancellable.promise.then(function (_ref) {
        var textItems = _ref.items;

        _this.setState({
          textItems: textItems
        }, _this.onLoadSuccess);
      })["catch"](function (error) {
        _this.onLoadError(error);
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onLoadSuccess", function () {
      var onGetTextSuccess = _this.props.onGetTextSuccess;
      var textItems = _this.state.textItems;
      if (onGetTextSuccess) onGetTextSuccess(textItems);
    });

    _defineProperty(_assertThisInitialized(_this), "onLoadError", function (error) {
      _this.setState({
        textItems: false
      });

      warning(error);
      var onGetTextError = _this.props.onGetTextError;
      if (onGetTextError) onGetTextError(error);
    });

    return _this;
  }

  _createClass(TextLayerInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var page = this.props.page;
      invariant(page, 'Attempted to load page text content, but no page was specified.');
      this.loadTextItems();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var page = this.props.page;

      if (prevProps.page && page !== prevProps.page) {
        this.loadTextItems();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      cancelRunningTask(this.runningTask);
    }
  }, {
    key: "unrotatedViewport",
    get: function get() {
      var _this$props = this.props,
          page = _this$props.page,
          scale = _this$props.scale;
      return page.getViewport({
        scale: scale
      });
    }
    /**
     * It might happen that the page is rotated by default. In such cases, we shouldn't rotate
     * text content.
     */

  }, {
    key: "rotate",
    get: function get() {
      var _this$props2 = this.props,
          page = _this$props2.page,
          rotate = _this$props2.rotate;
      return rotate - page.rotate;
    }
  }, {
    key: "renderTextItems",
    value: function renderTextItems() {
      var textItems = this.state.textItems;

      if (!textItems) {
        return null;
      }

      return textItems.map(function (textItem, itemIndex) {
        return /*#__PURE__*/React.createElement(TextLayerItem // eslint-disable-next-line react/no-array-index-key
        , _extends({
          key: itemIndex,
          itemIndex: itemIndex
        }, textItem));
      });
    }
  }, {
    key: "render",
    value: function render() {
      var viewport = this.unrotatedViewport,
          rotate = this.rotate;
      return /*#__PURE__*/React.createElement("div", {
        className: "react-pdf__Page__textContent",
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: "".concat(viewport.width, "px"),
          height: "".concat(viewport.height, "px"),
          color: 'transparent',
          transform: "translate(-50%, -50%) rotate(".concat(rotate, "deg)"),
          WebkitTransform: "translate(-50%, -50%) rotate(".concat(rotate, "deg)"),
          pointerEvents: 'none'
        }
      }, this.renderTextItems());
    }
  }]);

  return TextLayerInternal;
}(PureComponent);
TextLayerInternal.propTypes = {
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number
};
export default function TextLayer(props) {
  return /*#__PURE__*/React.createElement(PageContext.Consumer, null, function (context) {
    return /*#__PURE__*/React.createElement(TextLayerInternal, _extends({}, context, props));
  });
}