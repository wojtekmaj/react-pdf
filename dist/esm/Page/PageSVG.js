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
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import PageContext from '../PageContext';
import { isCancelException, makePageCallback } from '../shared/utils';
import { isPage, isRotate } from '../shared/propTypes';
export var PageSVGInternal = /*#__PURE__*/function (_PureComponent) {
  _inherits(PageSVGInternal, _PureComponent);

  var _super = _createSuper(PageSVGInternal);

  function PageSVGInternal() {
    var _this;

    _classCallCheck(this, PageSVGInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "state", {
      svg: null
    });

    _defineProperty(_assertThisInitialized(_this), "onRenderSuccess", function () {
      _this.renderer = null;
      var _this$props = _this.props,
          onRenderSuccess = _this$props.onRenderSuccess,
          page = _this$props.page,
          scale = _this$props.scale;
      if (onRenderSuccess) onRenderSuccess(makePageCallback(page, scale));
    });

    _defineProperty(_assertThisInitialized(_this), "onRenderError", function (error) {
      if (isCancelException(error)) {
        return;
      }

      warning(error);
      var onRenderError = _this.props.onRenderError;
      if (onRenderError) onRenderError(error);
    });

    _defineProperty(_assertThisInitialized(_this), "renderSVG", function () {
      var page = _this.props.page;
      _this.renderer = page.getOperatorList();
      return _this.renderer.then(function (operatorList) {
        var svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs);
        _this.renderer = svgGfx.getSVG(operatorList, _this.viewport).then(function (svg) {
          _this.setState({
            svg: svg
          }, _this.onRenderSuccess);
        })["catch"](_this.onRenderError);
      })["catch"](_this.onRenderError);
    });

    _defineProperty(_assertThisInitialized(_this), "drawPageOnContainer", function (element) {
      var svg = _this.state.svg;

      if (!element || !svg) {
        return;
      } // Append SVG element to the main container, if this hasn't been done already


      if (!element.firstElementChild) {
        element.appendChild(svg);
      }

      var _this$viewport = _this.viewport,
          width = _this$viewport.width,
          height = _this$viewport.height;
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
    });

    return _this;
  }

  _createClass(PageSVGInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.renderSVG();
    }
    /**
     * Called when a page is rendered successfully.
     */

  }, {
    key: "viewport",
    get: function get() {
      var _this$props2 = this.props,
          page = _this$props2.page,
          rotate = _this$props2.rotate,
          scale = _this$props2.scale;
      return page.getViewport({
        scale: scale,
        rotation: rotate
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$viewport2 = this.viewport,
          width = _this$viewport2.width,
          height = _this$viewport2.height;
      return /*#__PURE__*/React.createElement("div", {
        className: "react-pdf__Page__svg" // Note: This cannot be shortened, as we need this function to be called with each render.
        ,
        ref: function ref(_ref) {
          return _this2.drawPageOnContainer(_ref);
        },
        style: {
          display: 'block',
          backgroundColor: 'white',
          overflow: 'hidden',
          width: width,
          height: height,
          userSelect: 'none'
        }
      });
    }
  }]);

  return PageSVGInternal;
}(PureComponent);
PageSVGInternal.propTypes = {
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number.isRequired
};
export default function PageSVG(props) {
  return /*#__PURE__*/React.createElement(PageContext.Consumer, null, function (context) {
    return /*#__PURE__*/React.createElement(PageSVGInternal, _extends({}, context, props));
  });
}