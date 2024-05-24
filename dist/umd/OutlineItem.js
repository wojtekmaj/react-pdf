"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.OutlineItemInternal = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _DocumentContext = _interopRequireDefault(require("./DocumentContext"));

var _OutlineContext = _interopRequireDefault(require("./OutlineContext"));

var _Ref = _interopRequireDefault(require("./Ref"));

var _utils = require("./shared/utils");

var _propTypes2 = require("./shared/propTypes");

var _excluded = ["item"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var OutlineItemInternal = /*#__PURE__*/function (_PureComponent) {
  (0, _inherits2["default"])(OutlineItemInternal, _PureComponent);

  var _super = _createSuper(OutlineItemInternal);

  function OutlineItemInternal() {
    var _this;

    (0, _classCallCheck2["default"])(this, OutlineItemInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getDestination", function () {
      return new Promise(function (resolve, reject) {
        var _this$props = _this.props,
            item = _this$props.item,
            pdf = _this$props.pdf;

        if (!(0, _utils.isDefined)(_this.destination)) {
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
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getPageIndex", function () {
      return new Promise(function (resolve, reject) {
        var pdf = _this.props.pdf;

        if ((0, _utils.isDefined)(_this.pageIndex)) {
          resolve(_this.pageIndex);
        }

        _this.getDestination().then(function (destination) {
          if (!destination) {
            return;
          }

          var _destination = (0, _slicedToArray2["default"])(destination, 1),
              ref = _destination[0];

          pdf.getPageIndex(new _Ref["default"](ref)).then(resolve)["catch"](reject);
        });
      }).then(function (pageIndex) {
        _this.pageIndex = pageIndex;
        return _this.pageIndex;
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getPageNumber", function () {
      return new Promise(function (resolve, reject) {
        if ((0, _utils.isDefined)(_this.pageNumber)) {
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
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onClick", function (event) {
      var onClick = _this.props.onClick;
      event.preventDefault();

      if (!onClick) {
        return false;
      }

      return Promise.all([_this.getDestination(), _this.getPageIndex(), _this.getPageNumber()]).then(function (_ref) {
        var _ref2 = (0, _slicedToArray2["default"])(_ref, 3),
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

  (0, _createClass2["default"])(OutlineItemInternal, [{
    key: "renderSubitems",
    value: function renderSubitems() {
      var _this$props2 = this.props,
          item = _this$props2.item,
          otherProps = (0, _objectWithoutProperties2["default"])(_this$props2, _excluded);

      if (!item.items || !item.items.length) {
        return null;
      }

      var subitems = item.items;
      return /*#__PURE__*/_react["default"].createElement("ul", null, subitems.map(function (subitem, subitemIndex) {
        return /*#__PURE__*/_react["default"].createElement(OutlineItemInternal, (0, _extends2["default"])({
          key: typeof subitem.destination === 'string' ? subitem.destination : subitemIndex,
          item: subitem
        }, otherProps));
      }));
    }
  }, {
    key: "render",
    value: function render() {
      var item = this.props.item;
      return /*#__PURE__*/_react["default"].createElement("li", null, /*#__PURE__*/_react["default"].createElement("a", {
        href: "#",
        onClick: this.onClick
      }, item.title), this.renderSubitems());
    }
  }]);
  return OutlineItemInternal;
}(_react.PureComponent);

exports.OutlineItemInternal = OutlineItemInternal;

var isDestination = _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].arrayOf(_propTypes["default"].any)]);

OutlineItemInternal.propTypes = {
  item: _propTypes["default"].shape({
    dest: isDestination,
    items: _propTypes["default"].arrayOf(_propTypes["default"].shape({
      dest: isDestination,
      title: _propTypes["default"].string
    })),
    title: _propTypes["default"].string
  }).isRequired,
  onClick: _propTypes["default"].func,
  pdf: _propTypes2.isPdf.isRequired
};

var OutlineItem = function OutlineItem(props) {
  return /*#__PURE__*/_react["default"].createElement(_DocumentContext["default"].Consumer, null, function (documentContext) {
    return /*#__PURE__*/_react["default"].createElement(_OutlineContext["default"].Consumer, null, function (outlineContext) {
      return /*#__PURE__*/_react["default"].createElement(OutlineItemInternal, (0, _extends2["default"])({}, documentContext, outlineContext, props));
    });
  });
};

var _default = OutlineItem;
exports["default"] = _default;