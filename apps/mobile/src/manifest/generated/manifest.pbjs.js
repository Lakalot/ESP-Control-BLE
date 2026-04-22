/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util || $protobuf.default.util;

// Exported root namespace
const $root = {};

export const esp_control = $root.esp_control = (() => {

    /**
     * Namespace esp_control.
     * @exports esp_control
     * @namespace
     */
    const esp_control = {};

    /**
     * ValueType enum.
     * @name esp_control.ValueType
     * @enum {number}
     * @property {number} VALUE_TYPE_UNSPECIFIED=0 VALUE_TYPE_UNSPECIFIED value
     * @property {number} VALUE_TYPE_BOOL=1 VALUE_TYPE_BOOL value
     * @property {number} VALUE_TYPE_INT=2 VALUE_TYPE_INT value
     * @property {number} VALUE_TYPE_UINT=3 VALUE_TYPE_UINT value
     * @property {number} VALUE_TYPE_FLOAT=4 VALUE_TYPE_FLOAT value
     * @property {number} VALUE_TYPE_STRING=5 VALUE_TYPE_STRING value
     * @property {number} VALUE_TYPE_ENUM=6 VALUE_TYPE_ENUM value
     * @property {number} VALUE_TYPE_DURATION_MS=7 VALUE_TYPE_DURATION_MS value
     */
    esp_control.ValueType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "VALUE_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "VALUE_TYPE_BOOL"] = 1;
        values[valuesById[2] = "VALUE_TYPE_INT"] = 2;
        values[valuesById[3] = "VALUE_TYPE_UINT"] = 3;
        values[valuesById[4] = "VALUE_TYPE_FLOAT"] = 4;
        values[valuesById[5] = "VALUE_TYPE_STRING"] = 5;
        values[valuesById[6] = "VALUE_TYPE_ENUM"] = 6;
        values[valuesById[7] = "VALUE_TYPE_DURATION_MS"] = 7;
        return values;
    })();

    /**
     * ReadMode enum.
     * @name esp_control.ReadMode
     * @enum {number}
     * @property {number} READ_MODE_UNSPECIFIED=0 READ_MODE_UNSPECIFIED value
     * @property {number} READ_MODE_SNAPSHOT=1 READ_MODE_SNAPSHOT value
     * @property {number} READ_MODE_SUBSCRIBE=2 READ_MODE_SUBSCRIBE value
     * @property {number} READ_MODE_POLL=3 READ_MODE_POLL value
     */
    esp_control.ReadMode = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "READ_MODE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "READ_MODE_SNAPSHOT"] = 1;
        values[valuesById[2] = "READ_MODE_SUBSCRIBE"] = 2;
        values[valuesById[3] = "READ_MODE_POLL"] = 3;
        return values;
    })();

    /**
     * DangerLevel enum.
     * @name esp_control.DangerLevel
     * @enum {number}
     * @property {number} DANGER_LEVEL_UNSPECIFIED=0 DANGER_LEVEL_UNSPECIFIED value
     * @property {number} DANGER_LEVEL_NORMAL=1 DANGER_LEVEL_NORMAL value
     * @property {number} DANGER_LEVEL_ELEVATED=2 DANGER_LEVEL_ELEVATED value
     * @property {number} DANGER_LEVEL_DANGEROUS=3 DANGER_LEVEL_DANGEROUS value
     */
    esp_control.DangerLevel = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "DANGER_LEVEL_UNSPECIFIED"] = 0;
        values[valuesById[1] = "DANGER_LEVEL_NORMAL"] = 1;
        values[valuesById[2] = "DANGER_LEVEL_ELEVATED"] = 2;
        values[valuesById[3] = "DANGER_LEVEL_DANGEROUS"] = 3;
        return values;
    })();

    /**
     * NodeKind enum.
     * @name esp_control.NodeKind
     * @enum {number}
     * @property {number} NODE_KIND_UNSPECIFIED=0 NODE_KIND_UNSPECIFIED value
     * @property {number} NODE_KIND_STACK=1 NODE_KIND_STACK value
     * @property {number} NODE_KIND_ROW=2 NODE_KIND_ROW value
     * @property {number} NODE_KIND_GRID=3 NODE_KIND_GRID value
     * @property {number} NODE_KIND_SECTION=4 NODE_KIND_SECTION value
     * @property {number} NODE_KIND_WIDGET=5 NODE_KIND_WIDGET value
     */
    esp_control.NodeKind = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "NODE_KIND_UNSPECIFIED"] = 0;
        values[valuesById[1] = "NODE_KIND_STACK"] = 1;
        values[valuesById[2] = "NODE_KIND_ROW"] = 2;
        values[valuesById[3] = "NODE_KIND_GRID"] = 3;
        values[valuesById[4] = "NODE_KIND_SECTION"] = 4;
        values[valuesById[5] = "NODE_KIND_WIDGET"] = 5;
        return values;
    })();

    /**
     * WidgetKind enum.
     * @name esp_control.WidgetKind
     * @enum {number}
     * @property {number} WIDGET_KIND_UNSPECIFIED=0 WIDGET_KIND_UNSPECIFIED value
     * @property {number} WIDGET_KIND_TEXT=1 WIDGET_KIND_TEXT value
     * @property {number} WIDGET_KIND_STAT=2 WIDGET_KIND_STAT value
     * @property {number} WIDGET_KIND_TOGGLE=3 WIDGET_KIND_TOGGLE value
     * @property {number} WIDGET_KIND_BUTTON=4 WIDGET_KIND_BUTTON value
     * @property {number} WIDGET_KIND_SLIDER=5 WIDGET_KIND_SLIDER value
     * @property {number} WIDGET_KIND_SELECT=6 WIDGET_KIND_SELECT value
     * @property {number} WIDGET_KIND_TEXT_INPUT=7 WIDGET_KIND_TEXT_INPUT value
     * @property {number} WIDGET_KIND_BADGE=8 WIDGET_KIND_BADGE value
     * @property {number} WIDGET_KIND_PROGRESS=9 WIDGET_KIND_PROGRESS value
     * @property {number} WIDGET_KIND_TIMER=10 WIDGET_KIND_TIMER value
     */
    esp_control.WidgetKind = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "WIDGET_KIND_UNSPECIFIED"] = 0;
        values[valuesById[1] = "WIDGET_KIND_TEXT"] = 1;
        values[valuesById[2] = "WIDGET_KIND_STAT"] = 2;
        values[valuesById[3] = "WIDGET_KIND_TOGGLE"] = 3;
        values[valuesById[4] = "WIDGET_KIND_BUTTON"] = 4;
        values[valuesById[5] = "WIDGET_KIND_SLIDER"] = 5;
        values[valuesById[6] = "WIDGET_KIND_SELECT"] = 6;
        values[valuesById[7] = "WIDGET_KIND_TEXT_INPUT"] = 7;
        values[valuesById[8] = "WIDGET_KIND_BADGE"] = 8;
        values[valuesById[9] = "WIDGET_KIND_PROGRESS"] = 9;
        values[valuesById[10] = "WIDGET_KIND_TIMER"] = 10;
        return values;
    })();

    esp_control.StringEntry = (function() {

        /**
         * Properties of a StringEntry.
         * @memberof esp_control
         * @interface IStringEntry
         * @property {string|null} [value] StringEntry value
         */

        /**
         * Constructs a new StringEntry.
         * @memberof esp_control
         * @classdesc Represents a StringEntry.
         * @implements IStringEntry
         * @constructor
         * @param {esp_control.IStringEntry=} [properties] Properties to set
         */
        function StringEntry(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * StringEntry value.
         * @member {string} value
         * @memberof esp_control.StringEntry
         * @instance
         */
        StringEntry.prototype.value = "";

        /**
         * Creates a new StringEntry instance using the specified properties.
         * @function create
         * @memberof esp_control.StringEntry
         * @static
         * @param {esp_control.IStringEntry=} [properties] Properties to set
         * @returns {esp_control.StringEntry} StringEntry instance
         */
        StringEntry.create = function create(properties) {
            return new StringEntry(properties);
        };

        /**
         * Encodes the specified StringEntry message. Does not implicitly {@link esp_control.StringEntry.verify|verify} messages.
         * @function encode
         * @memberof esp_control.StringEntry
         * @static
         * @param {esp_control.IStringEntry} message StringEntry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StringEntry.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.value);
            return writer;
        };

        /**
         * Encodes the specified StringEntry message, length delimited. Does not implicitly {@link esp_control.StringEntry.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.StringEntry
         * @static
         * @param {esp_control.IStringEntry} message StringEntry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StringEntry.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a StringEntry message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.StringEntry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.StringEntry} StringEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StringEntry.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.StringEntry();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.value = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a StringEntry message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.StringEntry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.StringEntry} StringEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StringEntry.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a StringEntry message.
         * @function verify
         * @memberof esp_control.StringEntry
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        StringEntry.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.value != null && message.hasOwnProperty("value"))
                if (!$util.isString(message.value))
                    return "value: string expected";
            return null;
        };

        /**
         * Creates a StringEntry message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.StringEntry
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.StringEntry} StringEntry
         */
        StringEntry.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.StringEntry)
                return object;
            let message = new $root.esp_control.StringEntry();
            if (object.value != null)
                message.value = String(object.value);
            return message;
        };

        /**
         * Creates a plain object from a StringEntry message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.StringEntry
         * @static
         * @param {esp_control.StringEntry} message StringEntry
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        StringEntry.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.value = "";
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = message.value;
            return object;
        };

        /**
         * Converts this StringEntry to JSON.
         * @function toJSON
         * @memberof esp_control.StringEntry
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        StringEntry.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for StringEntry
         * @function getTypeUrl
         * @memberof esp_control.StringEntry
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        StringEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.StringEntry";
        };

        return StringEntry;
    })();

    esp_control.Rule = (function() {

        /**
         * Properties of a Rule.
         * @memberof esp_control
         * @interface IRule
         * @property {string|null} [jsonlogic] Rule jsonlogic
         */

        /**
         * Constructs a new Rule.
         * @memberof esp_control
         * @classdesc Represents a Rule.
         * @implements IRule
         * @constructor
         * @param {esp_control.IRule=} [properties] Properties to set
         */
        function Rule(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Rule jsonlogic.
         * @member {string} jsonlogic
         * @memberof esp_control.Rule
         * @instance
         */
        Rule.prototype.jsonlogic = "";

        /**
         * Creates a new Rule instance using the specified properties.
         * @function create
         * @memberof esp_control.Rule
         * @static
         * @param {esp_control.IRule=} [properties] Properties to set
         * @returns {esp_control.Rule} Rule instance
         */
        Rule.create = function create(properties) {
            return new Rule(properties);
        };

        /**
         * Encodes the specified Rule message. Does not implicitly {@link esp_control.Rule.verify|verify} messages.
         * @function encode
         * @memberof esp_control.Rule
         * @static
         * @param {esp_control.IRule} message Rule message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Rule.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.jsonlogic != null && Object.hasOwnProperty.call(message, "jsonlogic"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.jsonlogic);
            return writer;
        };

        /**
         * Encodes the specified Rule message, length delimited. Does not implicitly {@link esp_control.Rule.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.Rule
         * @static
         * @param {esp_control.IRule} message Rule message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Rule.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Rule message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.Rule
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.Rule} Rule
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Rule.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.Rule();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.jsonlogic = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Rule message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.Rule
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.Rule} Rule
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Rule.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Rule message.
         * @function verify
         * @memberof esp_control.Rule
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Rule.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.jsonlogic != null && message.hasOwnProperty("jsonlogic"))
                if (!$util.isString(message.jsonlogic))
                    return "jsonlogic: string expected";
            return null;
        };

        /**
         * Creates a Rule message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.Rule
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.Rule} Rule
         */
        Rule.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.Rule)
                return object;
            let message = new $root.esp_control.Rule();
            if (object.jsonlogic != null)
                message.jsonlogic = String(object.jsonlogic);
            return message;
        };

        /**
         * Creates a plain object from a Rule message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.Rule
         * @static
         * @param {esp_control.Rule} message Rule
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Rule.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.jsonlogic = "";
            if (message.jsonlogic != null && message.hasOwnProperty("jsonlogic"))
                object.jsonlogic = message.jsonlogic;
            return object;
        };

        /**
         * Converts this Rule to JSON.
         * @function toJSON
         * @memberof esp_control.Rule
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Rule.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Rule
         * @function getTypeUrl
         * @memberof esp_control.Rule
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Rule.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.Rule";
        };

        return Rule;
    })();

    esp_control.CommonField = (function() {

        /**
         * Properties of a CommonField.
         * @memberof esp_control
         * @interface ICommonField
         * @property {number|null} [keyIdx] CommonField keyIdx
         * @property {esp_control.ICommonValue|null} [value] CommonField value
         */

        /**
         * Constructs a new CommonField.
         * @memberof esp_control
         * @classdesc Represents a CommonField.
         * @implements ICommonField
         * @constructor
         * @param {esp_control.ICommonField=} [properties] Properties to set
         */
        function CommonField(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CommonField keyIdx.
         * @member {number} keyIdx
         * @memberof esp_control.CommonField
         * @instance
         */
        CommonField.prototype.keyIdx = 0;

        /**
         * CommonField value.
         * @member {esp_control.ICommonValue|null|undefined} value
         * @memberof esp_control.CommonField
         * @instance
         */
        CommonField.prototype.value = null;

        /**
         * Creates a new CommonField instance using the specified properties.
         * @function create
         * @memberof esp_control.CommonField
         * @static
         * @param {esp_control.ICommonField=} [properties] Properties to set
         * @returns {esp_control.CommonField} CommonField instance
         */
        CommonField.create = function create(properties) {
            return new CommonField(properties);
        };

        /**
         * Encodes the specified CommonField message. Does not implicitly {@link esp_control.CommonField.verify|verify} messages.
         * @function encode
         * @memberof esp_control.CommonField
         * @static
         * @param {esp_control.ICommonField} message CommonField message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CommonField.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.keyIdx != null && Object.hasOwnProperty.call(message, "keyIdx"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.keyIdx);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                $root.esp_control.CommonValue.encode(message.value, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified CommonField message, length delimited. Does not implicitly {@link esp_control.CommonField.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.CommonField
         * @static
         * @param {esp_control.ICommonField} message CommonField message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CommonField.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CommonField message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.CommonField
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.CommonField} CommonField
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CommonField.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.CommonField();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.keyIdx = reader.uint32();
                        break;
                    }
                case 2: {
                        message.value = $root.esp_control.CommonValue.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CommonField message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.CommonField
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.CommonField} CommonField
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CommonField.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CommonField message.
         * @function verify
         * @memberof esp_control.CommonField
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CommonField.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.keyIdx != null && message.hasOwnProperty("keyIdx"))
                if (!$util.isInteger(message.keyIdx))
                    return "keyIdx: integer expected";
            if (message.value != null && message.hasOwnProperty("value")) {
                let error = $root.esp_control.CommonValue.verify(message.value);
                if (error)
                    return "value." + error;
            }
            return null;
        };

        /**
         * Creates a CommonField message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.CommonField
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.CommonField} CommonField
         */
        CommonField.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.CommonField)
                return object;
            let message = new $root.esp_control.CommonField();
            if (object.keyIdx != null)
                message.keyIdx = object.keyIdx >>> 0;
            if (object.value != null) {
                if (typeof object.value !== "object")
                    throw TypeError(".esp_control.CommonField.value: object expected");
                message.value = $root.esp_control.CommonValue.fromObject(object.value);
            }
            return message;
        };

        /**
         * Creates a plain object from a CommonField message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.CommonField
         * @static
         * @param {esp_control.CommonField} message CommonField
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CommonField.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.keyIdx = 0;
                object.value = null;
            }
            if (message.keyIdx != null && message.hasOwnProperty("keyIdx"))
                object.keyIdx = message.keyIdx;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = $root.esp_control.CommonValue.toObject(message.value, options);
            return object;
        };

        /**
         * Converts this CommonField to JSON.
         * @function toJSON
         * @memberof esp_control.CommonField
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CommonField.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CommonField
         * @function getTypeUrl
         * @memberof esp_control.CommonField
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CommonField.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.CommonField";
        };

        return CommonField;
    })();

    esp_control.CommonObject = (function() {

        /**
         * Properties of a CommonObject.
         * @memberof esp_control
         * @interface ICommonObject
         * @property {Array.<esp_control.ICommonField>|null} [fields] CommonObject fields
         */

        /**
         * Constructs a new CommonObject.
         * @memberof esp_control
         * @classdesc Represents a CommonObject.
         * @implements ICommonObject
         * @constructor
         * @param {esp_control.ICommonObject=} [properties] Properties to set
         */
        function CommonObject(properties) {
            this.fields = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CommonObject fields.
         * @member {Array.<esp_control.ICommonField>} fields
         * @memberof esp_control.CommonObject
         * @instance
         */
        CommonObject.prototype.fields = $util.emptyArray;

        /**
         * Creates a new CommonObject instance using the specified properties.
         * @function create
         * @memberof esp_control.CommonObject
         * @static
         * @param {esp_control.ICommonObject=} [properties] Properties to set
         * @returns {esp_control.CommonObject} CommonObject instance
         */
        CommonObject.create = function create(properties) {
            return new CommonObject(properties);
        };

        /**
         * Encodes the specified CommonObject message. Does not implicitly {@link esp_control.CommonObject.verify|verify} messages.
         * @function encode
         * @memberof esp_control.CommonObject
         * @static
         * @param {esp_control.ICommonObject} message CommonObject message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CommonObject.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.fields != null && message.fields.length)
                for (let i = 0; i < message.fields.length; ++i)
                    $root.esp_control.CommonField.encode(message.fields[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified CommonObject message, length delimited. Does not implicitly {@link esp_control.CommonObject.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.CommonObject
         * @static
         * @param {esp_control.ICommonObject} message CommonObject message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CommonObject.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CommonObject message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.CommonObject
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.CommonObject} CommonObject
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CommonObject.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.CommonObject();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.fields && message.fields.length))
                            message.fields = [];
                        message.fields.push($root.esp_control.CommonField.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CommonObject message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.CommonObject
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.CommonObject} CommonObject
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CommonObject.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CommonObject message.
         * @function verify
         * @memberof esp_control.CommonObject
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CommonObject.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.fields != null && message.hasOwnProperty("fields")) {
                if (!Array.isArray(message.fields))
                    return "fields: array expected";
                for (let i = 0; i < message.fields.length; ++i) {
                    let error = $root.esp_control.CommonField.verify(message.fields[i]);
                    if (error)
                        return "fields." + error;
                }
            }
            return null;
        };

        /**
         * Creates a CommonObject message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.CommonObject
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.CommonObject} CommonObject
         */
        CommonObject.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.CommonObject)
                return object;
            let message = new $root.esp_control.CommonObject();
            if (object.fields) {
                if (!Array.isArray(object.fields))
                    throw TypeError(".esp_control.CommonObject.fields: array expected");
                message.fields = [];
                for (let i = 0; i < object.fields.length; ++i) {
                    if (typeof object.fields[i] !== "object")
                        throw TypeError(".esp_control.CommonObject.fields: object expected");
                    message.fields[i] = $root.esp_control.CommonField.fromObject(object.fields[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a CommonObject message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.CommonObject
         * @static
         * @param {esp_control.CommonObject} message CommonObject
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CommonObject.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.fields = [];
            if (message.fields && message.fields.length) {
                object.fields = [];
                for (let j = 0; j < message.fields.length; ++j)
                    object.fields[j] = $root.esp_control.CommonField.toObject(message.fields[j], options);
            }
            return object;
        };

        /**
         * Converts this CommonObject to JSON.
         * @function toJSON
         * @memberof esp_control.CommonObject
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CommonObject.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CommonObject
         * @function getTypeUrl
         * @memberof esp_control.CommonObject
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CommonObject.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.CommonObject";
        };

        return CommonObject;
    })();

    esp_control.CommonList = (function() {

        /**
         * Properties of a CommonList.
         * @memberof esp_control
         * @interface ICommonList
         * @property {Array.<esp_control.ICommonValue>|null} [items] CommonList items
         */

        /**
         * Constructs a new CommonList.
         * @memberof esp_control
         * @classdesc Represents a CommonList.
         * @implements ICommonList
         * @constructor
         * @param {esp_control.ICommonList=} [properties] Properties to set
         */
        function CommonList(properties) {
            this.items = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CommonList items.
         * @member {Array.<esp_control.ICommonValue>} items
         * @memberof esp_control.CommonList
         * @instance
         */
        CommonList.prototype.items = $util.emptyArray;

        /**
         * Creates a new CommonList instance using the specified properties.
         * @function create
         * @memberof esp_control.CommonList
         * @static
         * @param {esp_control.ICommonList=} [properties] Properties to set
         * @returns {esp_control.CommonList} CommonList instance
         */
        CommonList.create = function create(properties) {
            return new CommonList(properties);
        };

        /**
         * Encodes the specified CommonList message. Does not implicitly {@link esp_control.CommonList.verify|verify} messages.
         * @function encode
         * @memberof esp_control.CommonList
         * @static
         * @param {esp_control.ICommonList} message CommonList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CommonList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.items != null && message.items.length)
                for (let i = 0; i < message.items.length; ++i)
                    $root.esp_control.CommonValue.encode(message.items[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified CommonList message, length delimited. Does not implicitly {@link esp_control.CommonList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.CommonList
         * @static
         * @param {esp_control.ICommonList} message CommonList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CommonList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CommonList message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.CommonList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.CommonList} CommonList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CommonList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.CommonList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.items && message.items.length))
                            message.items = [];
                        message.items.push($root.esp_control.CommonValue.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CommonList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.CommonList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.CommonList} CommonList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CommonList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CommonList message.
         * @function verify
         * @memberof esp_control.CommonList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CommonList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.items != null && message.hasOwnProperty("items")) {
                if (!Array.isArray(message.items))
                    return "items: array expected";
                for (let i = 0; i < message.items.length; ++i) {
                    let error = $root.esp_control.CommonValue.verify(message.items[i]);
                    if (error)
                        return "items." + error;
                }
            }
            return null;
        };

        /**
         * Creates a CommonList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.CommonList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.CommonList} CommonList
         */
        CommonList.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.CommonList)
                return object;
            let message = new $root.esp_control.CommonList();
            if (object.items) {
                if (!Array.isArray(object.items))
                    throw TypeError(".esp_control.CommonList.items: array expected");
                message.items = [];
                for (let i = 0; i < object.items.length; ++i) {
                    if (typeof object.items[i] !== "object")
                        throw TypeError(".esp_control.CommonList.items: object expected");
                    message.items[i] = $root.esp_control.CommonValue.fromObject(object.items[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a CommonList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.CommonList
         * @static
         * @param {esp_control.CommonList} message CommonList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CommonList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.items = [];
            if (message.items && message.items.length) {
                object.items = [];
                for (let j = 0; j < message.items.length; ++j)
                    object.items[j] = $root.esp_control.CommonValue.toObject(message.items[j], options);
            }
            return object;
        };

        /**
         * Converts this CommonList to JSON.
         * @function toJSON
         * @memberof esp_control.CommonList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CommonList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CommonList
         * @function getTypeUrl
         * @memberof esp_control.CommonList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CommonList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.CommonList";
        };

        return CommonList;
    })();

    esp_control.CommonValue = (function() {

        /**
         * Properties of a CommonValue.
         * @memberof esp_control
         * @interface ICommonValue
         * @property {boolean|null} [boolValue] CommonValue boolValue
         * @property {number|null} [intValue] CommonValue intValue
         * @property {number|null} [uintValue] CommonValue uintValue
         * @property {number|null} [floatValue] CommonValue floatValue
         * @property {string|null} [stringValue] CommonValue stringValue
         * @property {string|null} [enumValue] CommonValue enumValue
         * @property {number|null} [durationMsValue] CommonValue durationMsValue
         * @property {esp_control.ICommonObject|null} [objectValue] CommonValue objectValue
         * @property {esp_control.ICommonList|null} [listValue] CommonValue listValue
         */

        /**
         * Constructs a new CommonValue.
         * @memberof esp_control
         * @classdesc Represents a CommonValue.
         * @implements ICommonValue
         * @constructor
         * @param {esp_control.ICommonValue=} [properties] Properties to set
         */
        function CommonValue(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CommonValue boolValue.
         * @member {boolean|null|undefined} boolValue
         * @memberof esp_control.CommonValue
         * @instance
         */
        CommonValue.prototype.boolValue = null;

        /**
         * CommonValue intValue.
         * @member {number|null|undefined} intValue
         * @memberof esp_control.CommonValue
         * @instance
         */
        CommonValue.prototype.intValue = null;

        /**
         * CommonValue uintValue.
         * @member {number|null|undefined} uintValue
         * @memberof esp_control.CommonValue
         * @instance
         */
        CommonValue.prototype.uintValue = null;

        /**
         * CommonValue floatValue.
         * @member {number|null|undefined} floatValue
         * @memberof esp_control.CommonValue
         * @instance
         */
        CommonValue.prototype.floatValue = null;

        /**
         * CommonValue stringValue.
         * @member {string|null|undefined} stringValue
         * @memberof esp_control.CommonValue
         * @instance
         */
        CommonValue.prototype.stringValue = null;

        /**
         * CommonValue enumValue.
         * @member {string|null|undefined} enumValue
         * @memberof esp_control.CommonValue
         * @instance
         */
        CommonValue.prototype.enumValue = null;

        /**
         * CommonValue durationMsValue.
         * @member {number|null|undefined} durationMsValue
         * @memberof esp_control.CommonValue
         * @instance
         */
        CommonValue.prototype.durationMsValue = null;

        /**
         * CommonValue objectValue.
         * @member {esp_control.ICommonObject|null|undefined} objectValue
         * @memberof esp_control.CommonValue
         * @instance
         */
        CommonValue.prototype.objectValue = null;

        /**
         * CommonValue listValue.
         * @member {esp_control.ICommonList|null|undefined} listValue
         * @memberof esp_control.CommonValue
         * @instance
         */
        CommonValue.prototype.listValue = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        /**
         * CommonValue kind.
         * @member {"boolValue"|"intValue"|"uintValue"|"floatValue"|"stringValue"|"enumValue"|"durationMsValue"|"objectValue"|"listValue"|undefined} kind
         * @memberof esp_control.CommonValue
         * @instance
         */
        Object.defineProperty(CommonValue.prototype, "kind", {
            get: $util.oneOfGetter($oneOfFields = ["boolValue", "intValue", "uintValue", "floatValue", "stringValue", "enumValue", "durationMsValue", "objectValue", "listValue"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new CommonValue instance using the specified properties.
         * @function create
         * @memberof esp_control.CommonValue
         * @static
         * @param {esp_control.ICommonValue=} [properties] Properties to set
         * @returns {esp_control.CommonValue} CommonValue instance
         */
        CommonValue.create = function create(properties) {
            return new CommonValue(properties);
        };

        /**
         * Encodes the specified CommonValue message. Does not implicitly {@link esp_control.CommonValue.verify|verify} messages.
         * @function encode
         * @memberof esp_control.CommonValue
         * @static
         * @param {esp_control.ICommonValue} message CommonValue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CommonValue.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.boolValue != null && Object.hasOwnProperty.call(message, "boolValue"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.boolValue);
            if (message.intValue != null && Object.hasOwnProperty.call(message, "intValue"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.intValue);
            if (message.uintValue != null && Object.hasOwnProperty.call(message, "uintValue"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.uintValue);
            if (message.floatValue != null && Object.hasOwnProperty.call(message, "floatValue"))
                writer.uint32(/* id 4, wireType 5 =*/37).float(message.floatValue);
            if (message.stringValue != null && Object.hasOwnProperty.call(message, "stringValue"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.stringValue);
            if (message.enumValue != null && Object.hasOwnProperty.call(message, "enumValue"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.enumValue);
            if (message.durationMsValue != null && Object.hasOwnProperty.call(message, "durationMsValue"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.durationMsValue);
            if (message.objectValue != null && Object.hasOwnProperty.call(message, "objectValue"))
                $root.esp_control.CommonObject.encode(message.objectValue, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.listValue != null && Object.hasOwnProperty.call(message, "listValue"))
                $root.esp_control.CommonList.encode(message.listValue, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified CommonValue message, length delimited. Does not implicitly {@link esp_control.CommonValue.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.CommonValue
         * @static
         * @param {esp_control.ICommonValue} message CommonValue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CommonValue.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CommonValue message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.CommonValue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.CommonValue} CommonValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CommonValue.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.CommonValue();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.boolValue = reader.bool();
                        break;
                    }
                case 2: {
                        message.intValue = reader.int32();
                        break;
                    }
                case 3: {
                        message.uintValue = reader.uint32();
                        break;
                    }
                case 4: {
                        message.floatValue = reader.float();
                        break;
                    }
                case 5: {
                        message.stringValue = reader.string();
                        break;
                    }
                case 6: {
                        message.enumValue = reader.string();
                        break;
                    }
                case 7: {
                        message.durationMsValue = reader.uint32();
                        break;
                    }
                case 8: {
                        message.objectValue = $root.esp_control.CommonObject.decode(reader, reader.uint32());
                        break;
                    }
                case 9: {
                        message.listValue = $root.esp_control.CommonList.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CommonValue message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.CommonValue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.CommonValue} CommonValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CommonValue.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CommonValue message.
         * @function verify
         * @memberof esp_control.CommonValue
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CommonValue.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                properties.kind = 1;
                if (typeof message.boolValue !== "boolean")
                    return "boolValue: boolean expected";
            }
            if (message.intValue != null && message.hasOwnProperty("intValue")) {
                if (properties.kind === 1)
                    return "kind: multiple values";
                properties.kind = 1;
                if (!$util.isInteger(message.intValue))
                    return "intValue: integer expected";
            }
            if (message.uintValue != null && message.hasOwnProperty("uintValue")) {
                if (properties.kind === 1)
                    return "kind: multiple values";
                properties.kind = 1;
                if (!$util.isInteger(message.uintValue))
                    return "uintValue: integer expected";
            }
            if (message.floatValue != null && message.hasOwnProperty("floatValue")) {
                if (properties.kind === 1)
                    return "kind: multiple values";
                properties.kind = 1;
                if (typeof message.floatValue !== "number")
                    return "floatValue: number expected";
            }
            if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                if (properties.kind === 1)
                    return "kind: multiple values";
                properties.kind = 1;
                if (!$util.isString(message.stringValue))
                    return "stringValue: string expected";
            }
            if (message.enumValue != null && message.hasOwnProperty("enumValue")) {
                if (properties.kind === 1)
                    return "kind: multiple values";
                properties.kind = 1;
                if (!$util.isString(message.enumValue))
                    return "enumValue: string expected";
            }
            if (message.durationMsValue != null && message.hasOwnProperty("durationMsValue")) {
                if (properties.kind === 1)
                    return "kind: multiple values";
                properties.kind = 1;
                if (!$util.isInteger(message.durationMsValue))
                    return "durationMsValue: integer expected";
            }
            if (message.objectValue != null && message.hasOwnProperty("objectValue")) {
                if (properties.kind === 1)
                    return "kind: multiple values";
                properties.kind = 1;
                {
                    let error = $root.esp_control.CommonObject.verify(message.objectValue);
                    if (error)
                        return "objectValue." + error;
                }
            }
            if (message.listValue != null && message.hasOwnProperty("listValue")) {
                if (properties.kind === 1)
                    return "kind: multiple values";
                properties.kind = 1;
                {
                    let error = $root.esp_control.CommonList.verify(message.listValue);
                    if (error)
                        return "listValue." + error;
                }
            }
            return null;
        };

        /**
         * Creates a CommonValue message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.CommonValue
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.CommonValue} CommonValue
         */
        CommonValue.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.CommonValue)
                return object;
            let message = new $root.esp_control.CommonValue();
            if (object.boolValue != null)
                message.boolValue = Boolean(object.boolValue);
            if (object.intValue != null)
                message.intValue = object.intValue | 0;
            if (object.uintValue != null)
                message.uintValue = object.uintValue >>> 0;
            if (object.floatValue != null)
                message.floatValue = Number(object.floatValue);
            if (object.stringValue != null)
                message.stringValue = String(object.stringValue);
            if (object.enumValue != null)
                message.enumValue = String(object.enumValue);
            if (object.durationMsValue != null)
                message.durationMsValue = object.durationMsValue >>> 0;
            if (object.objectValue != null) {
                if (typeof object.objectValue !== "object")
                    throw TypeError(".esp_control.CommonValue.objectValue: object expected");
                message.objectValue = $root.esp_control.CommonObject.fromObject(object.objectValue);
            }
            if (object.listValue != null) {
                if (typeof object.listValue !== "object")
                    throw TypeError(".esp_control.CommonValue.listValue: object expected");
                message.listValue = $root.esp_control.CommonList.fromObject(object.listValue);
            }
            return message;
        };

        /**
         * Creates a plain object from a CommonValue message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.CommonValue
         * @static
         * @param {esp_control.CommonValue} message CommonValue
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CommonValue.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                object.boolValue = message.boolValue;
                if (options.oneofs)
                    object.kind = "boolValue";
            }
            if (message.intValue != null && message.hasOwnProperty("intValue")) {
                object.intValue = message.intValue;
                if (options.oneofs)
                    object.kind = "intValue";
            }
            if (message.uintValue != null && message.hasOwnProperty("uintValue")) {
                object.uintValue = message.uintValue;
                if (options.oneofs)
                    object.kind = "uintValue";
            }
            if (message.floatValue != null && message.hasOwnProperty("floatValue")) {
                object.floatValue = options.json && !isFinite(message.floatValue) ? String(message.floatValue) : message.floatValue;
                if (options.oneofs)
                    object.kind = "floatValue";
            }
            if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                object.stringValue = message.stringValue;
                if (options.oneofs)
                    object.kind = "stringValue";
            }
            if (message.enumValue != null && message.hasOwnProperty("enumValue")) {
                object.enumValue = message.enumValue;
                if (options.oneofs)
                    object.kind = "enumValue";
            }
            if (message.durationMsValue != null && message.hasOwnProperty("durationMsValue")) {
                object.durationMsValue = message.durationMsValue;
                if (options.oneofs)
                    object.kind = "durationMsValue";
            }
            if (message.objectValue != null && message.hasOwnProperty("objectValue")) {
                object.objectValue = $root.esp_control.CommonObject.toObject(message.objectValue, options);
                if (options.oneofs)
                    object.kind = "objectValue";
            }
            if (message.listValue != null && message.hasOwnProperty("listValue")) {
                object.listValue = $root.esp_control.CommonList.toObject(message.listValue, options);
                if (options.oneofs)
                    object.kind = "listValue";
            }
            return object;
        };

        /**
         * Converts this CommonValue to JSON.
         * @function toJSON
         * @memberof esp_control.CommonValue
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CommonValue.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CommonValue
         * @function getTypeUrl
         * @memberof esp_control.CommonValue
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CommonValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.CommonValue";
        };

        return CommonValue;
    })();

    esp_control.CapabilitiesDef = (function() {

        /**
         * Properties of a CapabilitiesDef.
         * @memberof esp_control
         * @interface ICapabilitiesDef
         * @property {Array.<number>|null} [featureIdxs] CapabilitiesDef featureIdxs
         */

        /**
         * Constructs a new CapabilitiesDef.
         * @memberof esp_control
         * @classdesc Represents a CapabilitiesDef.
         * @implements ICapabilitiesDef
         * @constructor
         * @param {esp_control.ICapabilitiesDef=} [properties] Properties to set
         */
        function CapabilitiesDef(properties) {
            this.featureIdxs = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CapabilitiesDef featureIdxs.
         * @member {Array.<number>} featureIdxs
         * @memberof esp_control.CapabilitiesDef
         * @instance
         */
        CapabilitiesDef.prototype.featureIdxs = $util.emptyArray;

        /**
         * Creates a new CapabilitiesDef instance using the specified properties.
         * @function create
         * @memberof esp_control.CapabilitiesDef
         * @static
         * @param {esp_control.ICapabilitiesDef=} [properties] Properties to set
         * @returns {esp_control.CapabilitiesDef} CapabilitiesDef instance
         */
        CapabilitiesDef.create = function create(properties) {
            return new CapabilitiesDef(properties);
        };

        /**
         * Encodes the specified CapabilitiesDef message. Does not implicitly {@link esp_control.CapabilitiesDef.verify|verify} messages.
         * @function encode
         * @memberof esp_control.CapabilitiesDef
         * @static
         * @param {esp_control.ICapabilitiesDef} message CapabilitiesDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CapabilitiesDef.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.featureIdxs != null && message.featureIdxs.length) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork();
                for (let i = 0; i < message.featureIdxs.length; ++i)
                    writer.uint32(message.featureIdxs[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified CapabilitiesDef message, length delimited. Does not implicitly {@link esp_control.CapabilitiesDef.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.CapabilitiesDef
         * @static
         * @param {esp_control.ICapabilitiesDef} message CapabilitiesDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CapabilitiesDef.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CapabilitiesDef message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.CapabilitiesDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.CapabilitiesDef} CapabilitiesDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CapabilitiesDef.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.CapabilitiesDef();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.featureIdxs && message.featureIdxs.length))
                            message.featureIdxs = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.featureIdxs.push(reader.uint32());
                        } else
                            message.featureIdxs.push(reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CapabilitiesDef message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.CapabilitiesDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.CapabilitiesDef} CapabilitiesDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CapabilitiesDef.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CapabilitiesDef message.
         * @function verify
         * @memberof esp_control.CapabilitiesDef
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CapabilitiesDef.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.featureIdxs != null && message.hasOwnProperty("featureIdxs")) {
                if (!Array.isArray(message.featureIdxs))
                    return "featureIdxs: array expected";
                for (let i = 0; i < message.featureIdxs.length; ++i)
                    if (!$util.isInteger(message.featureIdxs[i]))
                        return "featureIdxs: integer[] expected";
            }
            return null;
        };

        /**
         * Creates a CapabilitiesDef message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.CapabilitiesDef
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.CapabilitiesDef} CapabilitiesDef
         */
        CapabilitiesDef.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.CapabilitiesDef)
                return object;
            let message = new $root.esp_control.CapabilitiesDef();
            if (object.featureIdxs) {
                if (!Array.isArray(object.featureIdxs))
                    throw TypeError(".esp_control.CapabilitiesDef.featureIdxs: array expected");
                message.featureIdxs = [];
                for (let i = 0; i < object.featureIdxs.length; ++i)
                    message.featureIdxs[i] = object.featureIdxs[i] >>> 0;
            }
            return message;
        };

        /**
         * Creates a plain object from a CapabilitiesDef message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.CapabilitiesDef
         * @static
         * @param {esp_control.CapabilitiesDef} message CapabilitiesDef
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CapabilitiesDef.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.featureIdxs = [];
            if (message.featureIdxs && message.featureIdxs.length) {
                object.featureIdxs = [];
                for (let j = 0; j < message.featureIdxs.length; ++j)
                    object.featureIdxs[j] = message.featureIdxs[j];
            }
            return object;
        };

        /**
         * Converts this CapabilitiesDef to JSON.
         * @function toJSON
         * @memberof esp_control.CapabilitiesDef
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CapabilitiesDef.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CapabilitiesDef
         * @function getTypeUrl
         * @memberof esp_control.CapabilitiesDef
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CapabilitiesDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.CapabilitiesDef";
        };

        return CapabilitiesDef;
    })();

    esp_control.ResourceDef = (function() {

        /**
         * Properties of a ResourceDef.
         * @memberof esp_control
         * @interface IResourceDef
         * @property {number|null} [id] ResourceDef id
         * @property {number|null} [slugIdx] ResourceDef slugIdx
         * @property {number|null} [labelIdx] ResourceDef labelIdx
         * @property {number|null} [unitIdx] ResourceDef unitIdx
         * @property {esp_control.ValueType|null} [valueType] ResourceDef valueType
         * @property {esp_control.ReadMode|null} [readMode] ResourceDef readMode
         * @property {number|null} [staleAfterMs] ResourceDef staleAfterMs
         * @property {number|null} [pollMs] ResourceDef pollMs
         * @property {Array.<number>|null} [enumValueIdxs] ResourceDef enumValueIdxs
         */

        /**
         * Constructs a new ResourceDef.
         * @memberof esp_control
         * @classdesc Represents a ResourceDef.
         * @implements IResourceDef
         * @constructor
         * @param {esp_control.IResourceDef=} [properties] Properties to set
         */
        function ResourceDef(properties) {
            this.enumValueIdxs = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ResourceDef id.
         * @member {number} id
         * @memberof esp_control.ResourceDef
         * @instance
         */
        ResourceDef.prototype.id = 0;

        /**
         * ResourceDef slugIdx.
         * @member {number} slugIdx
         * @memberof esp_control.ResourceDef
         * @instance
         */
        ResourceDef.prototype.slugIdx = 0;

        /**
         * ResourceDef labelIdx.
         * @member {number} labelIdx
         * @memberof esp_control.ResourceDef
         * @instance
         */
        ResourceDef.prototype.labelIdx = 0;

        /**
         * ResourceDef unitIdx.
         * @member {number} unitIdx
         * @memberof esp_control.ResourceDef
         * @instance
         */
        ResourceDef.prototype.unitIdx = 0;

        /**
         * ResourceDef valueType.
         * @member {esp_control.ValueType} valueType
         * @memberof esp_control.ResourceDef
         * @instance
         */
        ResourceDef.prototype.valueType = 0;

        /**
         * ResourceDef readMode.
         * @member {esp_control.ReadMode} readMode
         * @memberof esp_control.ResourceDef
         * @instance
         */
        ResourceDef.prototype.readMode = 0;

        /**
         * ResourceDef staleAfterMs.
         * @member {number} staleAfterMs
         * @memberof esp_control.ResourceDef
         * @instance
         */
        ResourceDef.prototype.staleAfterMs = 0;

        /**
         * ResourceDef pollMs.
         * @member {number} pollMs
         * @memberof esp_control.ResourceDef
         * @instance
         */
        ResourceDef.prototype.pollMs = 0;

        /**
         * ResourceDef enumValueIdxs.
         * @member {Array.<number>} enumValueIdxs
         * @memberof esp_control.ResourceDef
         * @instance
         */
        ResourceDef.prototype.enumValueIdxs = $util.emptyArray;

        /**
         * Creates a new ResourceDef instance using the specified properties.
         * @function create
         * @memberof esp_control.ResourceDef
         * @static
         * @param {esp_control.IResourceDef=} [properties] Properties to set
         * @returns {esp_control.ResourceDef} ResourceDef instance
         */
        ResourceDef.create = function create(properties) {
            return new ResourceDef(properties);
        };

        /**
         * Encodes the specified ResourceDef message. Does not implicitly {@link esp_control.ResourceDef.verify|verify} messages.
         * @function encode
         * @memberof esp_control.ResourceDef
         * @static
         * @param {esp_control.IResourceDef} message ResourceDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResourceDef.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
            if (message.slugIdx != null && Object.hasOwnProperty.call(message, "slugIdx"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.slugIdx);
            if (message.labelIdx != null && Object.hasOwnProperty.call(message, "labelIdx"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.labelIdx);
            if (message.unitIdx != null && Object.hasOwnProperty.call(message, "unitIdx"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.unitIdx);
            if (message.valueType != null && Object.hasOwnProperty.call(message, "valueType"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.valueType);
            if (message.readMode != null && Object.hasOwnProperty.call(message, "readMode"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.readMode);
            if (message.staleAfterMs != null && Object.hasOwnProperty.call(message, "staleAfterMs"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.staleAfterMs);
            if (message.pollMs != null && Object.hasOwnProperty.call(message, "pollMs"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.pollMs);
            if (message.enumValueIdxs != null && message.enumValueIdxs.length) {
                writer.uint32(/* id 9, wireType 2 =*/74).fork();
                for (let i = 0; i < message.enumValueIdxs.length; ++i)
                    writer.uint32(message.enumValueIdxs[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified ResourceDef message, length delimited. Does not implicitly {@link esp_control.ResourceDef.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.ResourceDef
         * @static
         * @param {esp_control.IResourceDef} message ResourceDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResourceDef.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ResourceDef message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.ResourceDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.ResourceDef} ResourceDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResourceDef.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.ResourceDef();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint32();
                        break;
                    }
                case 2: {
                        message.slugIdx = reader.uint32();
                        break;
                    }
                case 3: {
                        message.labelIdx = reader.uint32();
                        break;
                    }
                case 4: {
                        message.unitIdx = reader.uint32();
                        break;
                    }
                case 5: {
                        message.valueType = reader.int32();
                        break;
                    }
                case 6: {
                        message.readMode = reader.int32();
                        break;
                    }
                case 7: {
                        message.staleAfterMs = reader.uint32();
                        break;
                    }
                case 8: {
                        message.pollMs = reader.uint32();
                        break;
                    }
                case 9: {
                        if (!(message.enumValueIdxs && message.enumValueIdxs.length))
                            message.enumValueIdxs = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.enumValueIdxs.push(reader.uint32());
                        } else
                            message.enumValueIdxs.push(reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ResourceDef message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.ResourceDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.ResourceDef} ResourceDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResourceDef.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ResourceDef message.
         * @function verify
         * @memberof esp_control.ResourceDef
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ResourceDef.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.slugIdx != null && message.hasOwnProperty("slugIdx"))
                if (!$util.isInteger(message.slugIdx))
                    return "slugIdx: integer expected";
            if (message.labelIdx != null && message.hasOwnProperty("labelIdx"))
                if (!$util.isInteger(message.labelIdx))
                    return "labelIdx: integer expected";
            if (message.unitIdx != null && message.hasOwnProperty("unitIdx"))
                if (!$util.isInteger(message.unitIdx))
                    return "unitIdx: integer expected";
            if (message.valueType != null && message.hasOwnProperty("valueType"))
                switch (message.valueType) {
                default:
                    return "valueType: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    break;
                }
            if (message.readMode != null && message.hasOwnProperty("readMode"))
                switch (message.readMode) {
                default:
                    return "readMode: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.staleAfterMs != null && message.hasOwnProperty("staleAfterMs"))
                if (!$util.isInteger(message.staleAfterMs))
                    return "staleAfterMs: integer expected";
            if (message.pollMs != null && message.hasOwnProperty("pollMs"))
                if (!$util.isInteger(message.pollMs))
                    return "pollMs: integer expected";
            if (message.enumValueIdxs != null && message.hasOwnProperty("enumValueIdxs")) {
                if (!Array.isArray(message.enumValueIdxs))
                    return "enumValueIdxs: array expected";
                for (let i = 0; i < message.enumValueIdxs.length; ++i)
                    if (!$util.isInteger(message.enumValueIdxs[i]))
                        return "enumValueIdxs: integer[] expected";
            }
            return null;
        };

        /**
         * Creates a ResourceDef message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.ResourceDef
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.ResourceDef} ResourceDef
         */
        ResourceDef.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.ResourceDef)
                return object;
            let message = new $root.esp_control.ResourceDef();
            if (object.id != null)
                message.id = object.id >>> 0;
            if (object.slugIdx != null)
                message.slugIdx = object.slugIdx >>> 0;
            if (object.labelIdx != null)
                message.labelIdx = object.labelIdx >>> 0;
            if (object.unitIdx != null)
                message.unitIdx = object.unitIdx >>> 0;
            switch (object.valueType) {
            default:
                if (typeof object.valueType === "number") {
                    message.valueType = object.valueType;
                    break;
                }
                break;
            case "VALUE_TYPE_UNSPECIFIED":
            case 0:
                message.valueType = 0;
                break;
            case "VALUE_TYPE_BOOL":
            case 1:
                message.valueType = 1;
                break;
            case "VALUE_TYPE_INT":
            case 2:
                message.valueType = 2;
                break;
            case "VALUE_TYPE_UINT":
            case 3:
                message.valueType = 3;
                break;
            case "VALUE_TYPE_FLOAT":
            case 4:
                message.valueType = 4;
                break;
            case "VALUE_TYPE_STRING":
            case 5:
                message.valueType = 5;
                break;
            case "VALUE_TYPE_ENUM":
            case 6:
                message.valueType = 6;
                break;
            case "VALUE_TYPE_DURATION_MS":
            case 7:
                message.valueType = 7;
                break;
            }
            switch (object.readMode) {
            default:
                if (typeof object.readMode === "number") {
                    message.readMode = object.readMode;
                    break;
                }
                break;
            case "READ_MODE_UNSPECIFIED":
            case 0:
                message.readMode = 0;
                break;
            case "READ_MODE_SNAPSHOT":
            case 1:
                message.readMode = 1;
                break;
            case "READ_MODE_SUBSCRIBE":
            case 2:
                message.readMode = 2;
                break;
            case "READ_MODE_POLL":
            case 3:
                message.readMode = 3;
                break;
            }
            if (object.staleAfterMs != null)
                message.staleAfterMs = object.staleAfterMs >>> 0;
            if (object.pollMs != null)
                message.pollMs = object.pollMs >>> 0;
            if (object.enumValueIdxs) {
                if (!Array.isArray(object.enumValueIdxs))
                    throw TypeError(".esp_control.ResourceDef.enumValueIdxs: array expected");
                message.enumValueIdxs = [];
                for (let i = 0; i < object.enumValueIdxs.length; ++i)
                    message.enumValueIdxs[i] = object.enumValueIdxs[i] >>> 0;
            }
            return message;
        };

        /**
         * Creates a plain object from a ResourceDef message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.ResourceDef
         * @static
         * @param {esp_control.ResourceDef} message ResourceDef
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ResourceDef.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.enumValueIdxs = [];
            if (options.defaults) {
                object.id = 0;
                object.slugIdx = 0;
                object.labelIdx = 0;
                object.unitIdx = 0;
                object.valueType = options.enums === String ? "VALUE_TYPE_UNSPECIFIED" : 0;
                object.readMode = options.enums === String ? "READ_MODE_UNSPECIFIED" : 0;
                object.staleAfterMs = 0;
                object.pollMs = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.slugIdx != null && message.hasOwnProperty("slugIdx"))
                object.slugIdx = message.slugIdx;
            if (message.labelIdx != null && message.hasOwnProperty("labelIdx"))
                object.labelIdx = message.labelIdx;
            if (message.unitIdx != null && message.hasOwnProperty("unitIdx"))
                object.unitIdx = message.unitIdx;
            if (message.valueType != null && message.hasOwnProperty("valueType"))
                object.valueType = options.enums === String ? $root.esp_control.ValueType[message.valueType] === undefined ? message.valueType : $root.esp_control.ValueType[message.valueType] : message.valueType;
            if (message.readMode != null && message.hasOwnProperty("readMode"))
                object.readMode = options.enums === String ? $root.esp_control.ReadMode[message.readMode] === undefined ? message.readMode : $root.esp_control.ReadMode[message.readMode] : message.readMode;
            if (message.staleAfterMs != null && message.hasOwnProperty("staleAfterMs"))
                object.staleAfterMs = message.staleAfterMs;
            if (message.pollMs != null && message.hasOwnProperty("pollMs"))
                object.pollMs = message.pollMs;
            if (message.enumValueIdxs && message.enumValueIdxs.length) {
                object.enumValueIdxs = [];
                for (let j = 0; j < message.enumValueIdxs.length; ++j)
                    object.enumValueIdxs[j] = message.enumValueIdxs[j];
            }
            return object;
        };

        /**
         * Converts this ResourceDef to JSON.
         * @function toJSON
         * @memberof esp_control.ResourceDef
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ResourceDef.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ResourceDef
         * @function getTypeUrl
         * @memberof esp_control.ResourceDef
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ResourceDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.ResourceDef";
        };

        return ResourceDef;
    })();

    esp_control.ActionDef = (function() {

        /**
         * Properties of an ActionDef.
         * @memberof esp_control
         * @interface IActionDef
         * @property {number|null} [id] ActionDef id
         * @property {number|null} [slugIdx] ActionDef slugIdx
         * @property {number|null} [labelIdx] ActionDef labelIdx
         * @property {esp_control.DangerLevel|null} [dangerLevel] ActionDef dangerLevel
         * @property {number|null} [confirmIdx] ActionDef confirmIdx
         * @property {number|null} [cooldownMs] ActionDef cooldownMs
         * @property {number|null} [inputSchemaIdx] ActionDef inputSchemaIdx
         * @property {number|null} [resultSchemaIdx] ActionDef resultSchemaIdx
         */

        /**
         * Constructs a new ActionDef.
         * @memberof esp_control
         * @classdesc Represents an ActionDef.
         * @implements IActionDef
         * @constructor
         * @param {esp_control.IActionDef=} [properties] Properties to set
         */
        function ActionDef(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ActionDef id.
         * @member {number} id
         * @memberof esp_control.ActionDef
         * @instance
         */
        ActionDef.prototype.id = 0;

        /**
         * ActionDef slugIdx.
         * @member {number} slugIdx
         * @memberof esp_control.ActionDef
         * @instance
         */
        ActionDef.prototype.slugIdx = 0;

        /**
         * ActionDef labelIdx.
         * @member {number} labelIdx
         * @memberof esp_control.ActionDef
         * @instance
         */
        ActionDef.prototype.labelIdx = 0;

        /**
         * ActionDef dangerLevel.
         * @member {esp_control.DangerLevel} dangerLevel
         * @memberof esp_control.ActionDef
         * @instance
         */
        ActionDef.prototype.dangerLevel = 0;

        /**
         * ActionDef confirmIdx.
         * @member {number} confirmIdx
         * @memberof esp_control.ActionDef
         * @instance
         */
        ActionDef.prototype.confirmIdx = 0;

        /**
         * ActionDef cooldownMs.
         * @member {number} cooldownMs
         * @memberof esp_control.ActionDef
         * @instance
         */
        ActionDef.prototype.cooldownMs = 0;

        /**
         * ActionDef inputSchemaIdx.
         * @member {number} inputSchemaIdx
         * @memberof esp_control.ActionDef
         * @instance
         */
        ActionDef.prototype.inputSchemaIdx = 0;

        /**
         * ActionDef resultSchemaIdx.
         * @member {number} resultSchemaIdx
         * @memberof esp_control.ActionDef
         * @instance
         */
        ActionDef.prototype.resultSchemaIdx = 0;

        /**
         * Creates a new ActionDef instance using the specified properties.
         * @function create
         * @memberof esp_control.ActionDef
         * @static
         * @param {esp_control.IActionDef=} [properties] Properties to set
         * @returns {esp_control.ActionDef} ActionDef instance
         */
        ActionDef.create = function create(properties) {
            return new ActionDef(properties);
        };

        /**
         * Encodes the specified ActionDef message. Does not implicitly {@link esp_control.ActionDef.verify|verify} messages.
         * @function encode
         * @memberof esp_control.ActionDef
         * @static
         * @param {esp_control.IActionDef} message ActionDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActionDef.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
            if (message.slugIdx != null && Object.hasOwnProperty.call(message, "slugIdx"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.slugIdx);
            if (message.labelIdx != null && Object.hasOwnProperty.call(message, "labelIdx"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.labelIdx);
            if (message.dangerLevel != null && Object.hasOwnProperty.call(message, "dangerLevel"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.dangerLevel);
            if (message.confirmIdx != null && Object.hasOwnProperty.call(message, "confirmIdx"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.confirmIdx);
            if (message.cooldownMs != null && Object.hasOwnProperty.call(message, "cooldownMs"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.cooldownMs);
            if (message.inputSchemaIdx != null && Object.hasOwnProperty.call(message, "inputSchemaIdx"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.inputSchemaIdx);
            if (message.resultSchemaIdx != null && Object.hasOwnProperty.call(message, "resultSchemaIdx"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.resultSchemaIdx);
            return writer;
        };

        /**
         * Encodes the specified ActionDef message, length delimited. Does not implicitly {@link esp_control.ActionDef.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.ActionDef
         * @static
         * @param {esp_control.IActionDef} message ActionDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActionDef.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ActionDef message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.ActionDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.ActionDef} ActionDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActionDef.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.ActionDef();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint32();
                        break;
                    }
                case 2: {
                        message.slugIdx = reader.uint32();
                        break;
                    }
                case 3: {
                        message.labelIdx = reader.uint32();
                        break;
                    }
                case 4: {
                        message.dangerLevel = reader.int32();
                        break;
                    }
                case 5: {
                        message.confirmIdx = reader.uint32();
                        break;
                    }
                case 6: {
                        message.cooldownMs = reader.uint32();
                        break;
                    }
                case 7: {
                        message.inputSchemaIdx = reader.uint32();
                        break;
                    }
                case 8: {
                        message.resultSchemaIdx = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ActionDef message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.ActionDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.ActionDef} ActionDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActionDef.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ActionDef message.
         * @function verify
         * @memberof esp_control.ActionDef
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ActionDef.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.slugIdx != null && message.hasOwnProperty("slugIdx"))
                if (!$util.isInteger(message.slugIdx))
                    return "slugIdx: integer expected";
            if (message.labelIdx != null && message.hasOwnProperty("labelIdx"))
                if (!$util.isInteger(message.labelIdx))
                    return "labelIdx: integer expected";
            if (message.dangerLevel != null && message.hasOwnProperty("dangerLevel"))
                switch (message.dangerLevel) {
                default:
                    return "dangerLevel: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.confirmIdx != null && message.hasOwnProperty("confirmIdx"))
                if (!$util.isInteger(message.confirmIdx))
                    return "confirmIdx: integer expected";
            if (message.cooldownMs != null && message.hasOwnProperty("cooldownMs"))
                if (!$util.isInteger(message.cooldownMs))
                    return "cooldownMs: integer expected";
            if (message.inputSchemaIdx != null && message.hasOwnProperty("inputSchemaIdx"))
                if (!$util.isInteger(message.inputSchemaIdx))
                    return "inputSchemaIdx: integer expected";
            if (message.resultSchemaIdx != null && message.hasOwnProperty("resultSchemaIdx"))
                if (!$util.isInteger(message.resultSchemaIdx))
                    return "resultSchemaIdx: integer expected";
            return null;
        };

        /**
         * Creates an ActionDef message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.ActionDef
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.ActionDef} ActionDef
         */
        ActionDef.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.ActionDef)
                return object;
            let message = new $root.esp_control.ActionDef();
            if (object.id != null)
                message.id = object.id >>> 0;
            if (object.slugIdx != null)
                message.slugIdx = object.slugIdx >>> 0;
            if (object.labelIdx != null)
                message.labelIdx = object.labelIdx >>> 0;
            switch (object.dangerLevel) {
            default:
                if (typeof object.dangerLevel === "number") {
                    message.dangerLevel = object.dangerLevel;
                    break;
                }
                break;
            case "DANGER_LEVEL_UNSPECIFIED":
            case 0:
                message.dangerLevel = 0;
                break;
            case "DANGER_LEVEL_NORMAL":
            case 1:
                message.dangerLevel = 1;
                break;
            case "DANGER_LEVEL_ELEVATED":
            case 2:
                message.dangerLevel = 2;
                break;
            case "DANGER_LEVEL_DANGEROUS":
            case 3:
                message.dangerLevel = 3;
                break;
            }
            if (object.confirmIdx != null)
                message.confirmIdx = object.confirmIdx >>> 0;
            if (object.cooldownMs != null)
                message.cooldownMs = object.cooldownMs >>> 0;
            if (object.inputSchemaIdx != null)
                message.inputSchemaIdx = object.inputSchemaIdx >>> 0;
            if (object.resultSchemaIdx != null)
                message.resultSchemaIdx = object.resultSchemaIdx >>> 0;
            return message;
        };

        /**
         * Creates a plain object from an ActionDef message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.ActionDef
         * @static
         * @param {esp_control.ActionDef} message ActionDef
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ActionDef.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = 0;
                object.slugIdx = 0;
                object.labelIdx = 0;
                object.dangerLevel = options.enums === String ? "DANGER_LEVEL_UNSPECIFIED" : 0;
                object.confirmIdx = 0;
                object.cooldownMs = 0;
                object.inputSchemaIdx = 0;
                object.resultSchemaIdx = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.slugIdx != null && message.hasOwnProperty("slugIdx"))
                object.slugIdx = message.slugIdx;
            if (message.labelIdx != null && message.hasOwnProperty("labelIdx"))
                object.labelIdx = message.labelIdx;
            if (message.dangerLevel != null && message.hasOwnProperty("dangerLevel"))
                object.dangerLevel = options.enums === String ? $root.esp_control.DangerLevel[message.dangerLevel] === undefined ? message.dangerLevel : $root.esp_control.DangerLevel[message.dangerLevel] : message.dangerLevel;
            if (message.confirmIdx != null && message.hasOwnProperty("confirmIdx"))
                object.confirmIdx = message.confirmIdx;
            if (message.cooldownMs != null && message.hasOwnProperty("cooldownMs"))
                object.cooldownMs = message.cooldownMs;
            if (message.inputSchemaIdx != null && message.hasOwnProperty("inputSchemaIdx"))
                object.inputSchemaIdx = message.inputSchemaIdx;
            if (message.resultSchemaIdx != null && message.hasOwnProperty("resultSchemaIdx"))
                object.resultSchemaIdx = message.resultSchemaIdx;
            return object;
        };

        /**
         * Converts this ActionDef to JSON.
         * @function toJSON
         * @memberof esp_control.ActionDef
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ActionDef.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ActionDef
         * @function getTypeUrl
         * @memberof esp_control.ActionDef
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ActionDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.ActionDef";
        };

        return ActionDef;
    })();

    esp_control.ScreenDef = (function() {

        /**
         * Properties of a ScreenDef.
         * @memberof esp_control
         * @interface IScreenDef
         * @property {number|null} [id] ScreenDef id
         * @property {number|null} [slugIdx] ScreenDef slugIdx
         * @property {number|null} [titleIdx] ScreenDef titleIdx
         * @property {number|null} [routeKeyIdx] ScreenDef routeKeyIdx
         * @property {number|null} [rootNodeId] ScreenDef rootNodeId
         * @property {Array.<esp_control.IRule>|null} [entryRules] ScreenDef entryRules
         */

        /**
         * Constructs a new ScreenDef.
         * @memberof esp_control
         * @classdesc Represents a ScreenDef.
         * @implements IScreenDef
         * @constructor
         * @param {esp_control.IScreenDef=} [properties] Properties to set
         */
        function ScreenDef(properties) {
            this.entryRules = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ScreenDef id.
         * @member {number} id
         * @memberof esp_control.ScreenDef
         * @instance
         */
        ScreenDef.prototype.id = 0;

        /**
         * ScreenDef slugIdx.
         * @member {number} slugIdx
         * @memberof esp_control.ScreenDef
         * @instance
         */
        ScreenDef.prototype.slugIdx = 0;

        /**
         * ScreenDef titleIdx.
         * @member {number} titleIdx
         * @memberof esp_control.ScreenDef
         * @instance
         */
        ScreenDef.prototype.titleIdx = 0;

        /**
         * ScreenDef routeKeyIdx.
         * @member {number} routeKeyIdx
         * @memberof esp_control.ScreenDef
         * @instance
         */
        ScreenDef.prototype.routeKeyIdx = 0;

        /**
         * ScreenDef rootNodeId.
         * @member {number} rootNodeId
         * @memberof esp_control.ScreenDef
         * @instance
         */
        ScreenDef.prototype.rootNodeId = 0;

        /**
         * ScreenDef entryRules.
         * @member {Array.<esp_control.IRule>} entryRules
         * @memberof esp_control.ScreenDef
         * @instance
         */
        ScreenDef.prototype.entryRules = $util.emptyArray;

        /**
         * Creates a new ScreenDef instance using the specified properties.
         * @function create
         * @memberof esp_control.ScreenDef
         * @static
         * @param {esp_control.IScreenDef=} [properties] Properties to set
         * @returns {esp_control.ScreenDef} ScreenDef instance
         */
        ScreenDef.create = function create(properties) {
            return new ScreenDef(properties);
        };

        /**
         * Encodes the specified ScreenDef message. Does not implicitly {@link esp_control.ScreenDef.verify|verify} messages.
         * @function encode
         * @memberof esp_control.ScreenDef
         * @static
         * @param {esp_control.IScreenDef} message ScreenDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ScreenDef.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
            if (message.slugIdx != null && Object.hasOwnProperty.call(message, "slugIdx"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.slugIdx);
            if (message.titleIdx != null && Object.hasOwnProperty.call(message, "titleIdx"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.titleIdx);
            if (message.routeKeyIdx != null && Object.hasOwnProperty.call(message, "routeKeyIdx"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.routeKeyIdx);
            if (message.rootNodeId != null && Object.hasOwnProperty.call(message, "rootNodeId"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.rootNodeId);
            if (message.entryRules != null && message.entryRules.length)
                for (let i = 0; i < message.entryRules.length; ++i)
                    $root.esp_control.Rule.encode(message.entryRules[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ScreenDef message, length delimited. Does not implicitly {@link esp_control.ScreenDef.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.ScreenDef
         * @static
         * @param {esp_control.IScreenDef} message ScreenDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ScreenDef.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ScreenDef message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.ScreenDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.ScreenDef} ScreenDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ScreenDef.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.ScreenDef();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint32();
                        break;
                    }
                case 2: {
                        message.slugIdx = reader.uint32();
                        break;
                    }
                case 3: {
                        message.titleIdx = reader.uint32();
                        break;
                    }
                case 4: {
                        message.routeKeyIdx = reader.uint32();
                        break;
                    }
                case 5: {
                        message.rootNodeId = reader.uint32();
                        break;
                    }
                case 6: {
                        if (!(message.entryRules && message.entryRules.length))
                            message.entryRules = [];
                        message.entryRules.push($root.esp_control.Rule.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ScreenDef message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.ScreenDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.ScreenDef} ScreenDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ScreenDef.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ScreenDef message.
         * @function verify
         * @memberof esp_control.ScreenDef
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ScreenDef.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.slugIdx != null && message.hasOwnProperty("slugIdx"))
                if (!$util.isInteger(message.slugIdx))
                    return "slugIdx: integer expected";
            if (message.titleIdx != null && message.hasOwnProperty("titleIdx"))
                if (!$util.isInteger(message.titleIdx))
                    return "titleIdx: integer expected";
            if (message.routeKeyIdx != null && message.hasOwnProperty("routeKeyIdx"))
                if (!$util.isInteger(message.routeKeyIdx))
                    return "routeKeyIdx: integer expected";
            if (message.rootNodeId != null && message.hasOwnProperty("rootNodeId"))
                if (!$util.isInteger(message.rootNodeId))
                    return "rootNodeId: integer expected";
            if (message.entryRules != null && message.hasOwnProperty("entryRules")) {
                if (!Array.isArray(message.entryRules))
                    return "entryRules: array expected";
                for (let i = 0; i < message.entryRules.length; ++i) {
                    let error = $root.esp_control.Rule.verify(message.entryRules[i]);
                    if (error)
                        return "entryRules." + error;
                }
            }
            return null;
        };

        /**
         * Creates a ScreenDef message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.ScreenDef
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.ScreenDef} ScreenDef
         */
        ScreenDef.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.ScreenDef)
                return object;
            let message = new $root.esp_control.ScreenDef();
            if (object.id != null)
                message.id = object.id >>> 0;
            if (object.slugIdx != null)
                message.slugIdx = object.slugIdx >>> 0;
            if (object.titleIdx != null)
                message.titleIdx = object.titleIdx >>> 0;
            if (object.routeKeyIdx != null)
                message.routeKeyIdx = object.routeKeyIdx >>> 0;
            if (object.rootNodeId != null)
                message.rootNodeId = object.rootNodeId >>> 0;
            if (object.entryRules) {
                if (!Array.isArray(object.entryRules))
                    throw TypeError(".esp_control.ScreenDef.entryRules: array expected");
                message.entryRules = [];
                for (let i = 0; i < object.entryRules.length; ++i) {
                    if (typeof object.entryRules[i] !== "object")
                        throw TypeError(".esp_control.ScreenDef.entryRules: object expected");
                    message.entryRules[i] = $root.esp_control.Rule.fromObject(object.entryRules[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a ScreenDef message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.ScreenDef
         * @static
         * @param {esp_control.ScreenDef} message ScreenDef
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ScreenDef.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.entryRules = [];
            if (options.defaults) {
                object.id = 0;
                object.slugIdx = 0;
                object.titleIdx = 0;
                object.routeKeyIdx = 0;
                object.rootNodeId = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.slugIdx != null && message.hasOwnProperty("slugIdx"))
                object.slugIdx = message.slugIdx;
            if (message.titleIdx != null && message.hasOwnProperty("titleIdx"))
                object.titleIdx = message.titleIdx;
            if (message.routeKeyIdx != null && message.hasOwnProperty("routeKeyIdx"))
                object.routeKeyIdx = message.routeKeyIdx;
            if (message.rootNodeId != null && message.hasOwnProperty("rootNodeId"))
                object.rootNodeId = message.rootNodeId;
            if (message.entryRules && message.entryRules.length) {
                object.entryRules = [];
                for (let j = 0; j < message.entryRules.length; ++j)
                    object.entryRules[j] = $root.esp_control.Rule.toObject(message.entryRules[j], options);
            }
            return object;
        };

        /**
         * Converts this ScreenDef to JSON.
         * @function toJSON
         * @memberof esp_control.ScreenDef
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ScreenDef.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ScreenDef
         * @function getTypeUrl
         * @memberof esp_control.ScreenDef
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ScreenDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.ScreenDef";
        };

        return ScreenDef;
    })();

    esp_control.NavBarItemDef = (function() {

        /**
         * Properties of a NavBarItemDef.
         * @memberof esp_control
         * @interface INavBarItemDef
         * @property {number|null} [idIdx] NavBarItemDef idIdx
         * @property {number|null} [labelIdx] NavBarItemDef labelIdx
         * @property {number|null} [iconIdx] NavBarItemDef iconIdx
         * @property {number|null} [screenId] NavBarItemDef screenId
         */

        /**
         * Constructs a new NavBarItemDef.
         * @memberof esp_control
         * @classdesc Represents a NavBarItemDef.
         * @implements INavBarItemDef
         * @constructor
         * @param {esp_control.INavBarItemDef=} [properties] Properties to set
         */
        function NavBarItemDef(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * NavBarItemDef idIdx.
         * @member {number} idIdx
         * @memberof esp_control.NavBarItemDef
         * @instance
         */
        NavBarItemDef.prototype.idIdx = 0;

        /**
         * NavBarItemDef labelIdx.
         * @member {number} labelIdx
         * @memberof esp_control.NavBarItemDef
         * @instance
         */
        NavBarItemDef.prototype.labelIdx = 0;

        /**
         * NavBarItemDef iconIdx.
         * @member {number} iconIdx
         * @memberof esp_control.NavBarItemDef
         * @instance
         */
        NavBarItemDef.prototype.iconIdx = 0;

        /**
         * NavBarItemDef screenId.
         * @member {number} screenId
         * @memberof esp_control.NavBarItemDef
         * @instance
         */
        NavBarItemDef.prototype.screenId = 0;

        /**
         * Creates a new NavBarItemDef instance using the specified properties.
         * @function create
         * @memberof esp_control.NavBarItemDef
         * @static
         * @param {esp_control.INavBarItemDef=} [properties] Properties to set
         * @returns {esp_control.NavBarItemDef} NavBarItemDef instance
         */
        NavBarItemDef.create = function create(properties) {
            return new NavBarItemDef(properties);
        };

        /**
         * Encodes the specified NavBarItemDef message. Does not implicitly {@link esp_control.NavBarItemDef.verify|verify} messages.
         * @function encode
         * @memberof esp_control.NavBarItemDef
         * @static
         * @param {esp_control.INavBarItemDef} message NavBarItemDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NavBarItemDef.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.idIdx != null && Object.hasOwnProperty.call(message, "idIdx"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.idIdx);
            if (message.labelIdx != null && Object.hasOwnProperty.call(message, "labelIdx"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.labelIdx);
            if (message.iconIdx != null && Object.hasOwnProperty.call(message, "iconIdx"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.iconIdx);
            if (message.screenId != null && Object.hasOwnProperty.call(message, "screenId"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.screenId);
            return writer;
        };

        /**
         * Encodes the specified NavBarItemDef message, length delimited. Does not implicitly {@link esp_control.NavBarItemDef.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.NavBarItemDef
         * @static
         * @param {esp_control.INavBarItemDef} message NavBarItemDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NavBarItemDef.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a NavBarItemDef message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.NavBarItemDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.NavBarItemDef} NavBarItemDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NavBarItemDef.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.NavBarItemDef();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.idIdx = reader.uint32();
                        break;
                    }
                case 2: {
                        message.labelIdx = reader.uint32();
                        break;
                    }
                case 3: {
                        message.iconIdx = reader.uint32();
                        break;
                    }
                case 4: {
                        message.screenId = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a NavBarItemDef message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.NavBarItemDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.NavBarItemDef} NavBarItemDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NavBarItemDef.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a NavBarItemDef message.
         * @function verify
         * @memberof esp_control.NavBarItemDef
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        NavBarItemDef.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.idIdx != null && message.hasOwnProperty("idIdx"))
                if (!$util.isInteger(message.idIdx))
                    return "idIdx: integer expected";
            if (message.labelIdx != null && message.hasOwnProperty("labelIdx"))
                if (!$util.isInteger(message.labelIdx))
                    return "labelIdx: integer expected";
            if (message.iconIdx != null && message.hasOwnProperty("iconIdx"))
                if (!$util.isInteger(message.iconIdx))
                    return "iconIdx: integer expected";
            if (message.screenId != null && message.hasOwnProperty("screenId"))
                if (!$util.isInteger(message.screenId))
                    return "screenId: integer expected";
            return null;
        };

        /**
         * Creates a NavBarItemDef message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.NavBarItemDef
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.NavBarItemDef} NavBarItemDef
         */
        NavBarItemDef.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.NavBarItemDef)
                return object;
            let message = new $root.esp_control.NavBarItemDef();
            if (object.idIdx != null)
                message.idIdx = object.idIdx >>> 0;
            if (object.labelIdx != null)
                message.labelIdx = object.labelIdx >>> 0;
            if (object.iconIdx != null)
                message.iconIdx = object.iconIdx >>> 0;
            if (object.screenId != null)
                message.screenId = object.screenId >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a NavBarItemDef message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.NavBarItemDef
         * @static
         * @param {esp_control.NavBarItemDef} message NavBarItemDef
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        NavBarItemDef.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.idIdx = 0;
                object.labelIdx = 0;
                object.iconIdx = 0;
                object.screenId = 0;
            }
            if (message.idIdx != null && message.hasOwnProperty("idIdx"))
                object.idIdx = message.idIdx;
            if (message.labelIdx != null && message.hasOwnProperty("labelIdx"))
                object.labelIdx = message.labelIdx;
            if (message.iconIdx != null && message.hasOwnProperty("iconIdx"))
                object.iconIdx = message.iconIdx;
            if (message.screenId != null && message.hasOwnProperty("screenId"))
                object.screenId = message.screenId;
            return object;
        };

        /**
         * Converts this NavBarItemDef to JSON.
         * @function toJSON
         * @memberof esp_control.NavBarItemDef
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        NavBarItemDef.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for NavBarItemDef
         * @function getTypeUrl
         * @memberof esp_control.NavBarItemDef
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        NavBarItemDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.NavBarItemDef";
        };

        return NavBarItemDef;
    })();

    esp_control.NavBarDef = (function() {

        /**
         * Properties of a NavBarDef.
         * @memberof esp_control
         * @interface INavBarDef
         * @property {Array.<esp_control.INavBarItemDef>|null} [items] NavBarDef items
         */

        /**
         * Constructs a new NavBarDef.
         * @memberof esp_control
         * @classdesc Represents a NavBarDef.
         * @implements INavBarDef
         * @constructor
         * @param {esp_control.INavBarDef=} [properties] Properties to set
         */
        function NavBarDef(properties) {
            this.items = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * NavBarDef items.
         * @member {Array.<esp_control.INavBarItemDef>} items
         * @memberof esp_control.NavBarDef
         * @instance
         */
        NavBarDef.prototype.items = $util.emptyArray;

        /**
         * Creates a new NavBarDef instance using the specified properties.
         * @function create
         * @memberof esp_control.NavBarDef
         * @static
         * @param {esp_control.INavBarDef=} [properties] Properties to set
         * @returns {esp_control.NavBarDef} NavBarDef instance
         */
        NavBarDef.create = function create(properties) {
            return new NavBarDef(properties);
        };

        /**
         * Encodes the specified NavBarDef message. Does not implicitly {@link esp_control.NavBarDef.verify|verify} messages.
         * @function encode
         * @memberof esp_control.NavBarDef
         * @static
         * @param {esp_control.INavBarDef} message NavBarDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NavBarDef.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.items != null && message.items.length)
                for (let i = 0; i < message.items.length; ++i)
                    $root.esp_control.NavBarItemDef.encode(message.items[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified NavBarDef message, length delimited. Does not implicitly {@link esp_control.NavBarDef.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.NavBarDef
         * @static
         * @param {esp_control.INavBarDef} message NavBarDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NavBarDef.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a NavBarDef message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.NavBarDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.NavBarDef} NavBarDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NavBarDef.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.NavBarDef();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.items && message.items.length))
                            message.items = [];
                        message.items.push($root.esp_control.NavBarItemDef.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a NavBarDef message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.NavBarDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.NavBarDef} NavBarDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NavBarDef.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a NavBarDef message.
         * @function verify
         * @memberof esp_control.NavBarDef
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        NavBarDef.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.items != null && message.hasOwnProperty("items")) {
                if (!Array.isArray(message.items))
                    return "items: array expected";
                for (let i = 0; i < message.items.length; ++i) {
                    let error = $root.esp_control.NavBarItemDef.verify(message.items[i]);
                    if (error)
                        return "items." + error;
                }
            }
            return null;
        };

        /**
         * Creates a NavBarDef message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.NavBarDef
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.NavBarDef} NavBarDef
         */
        NavBarDef.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.NavBarDef)
                return object;
            let message = new $root.esp_control.NavBarDef();
            if (object.items) {
                if (!Array.isArray(object.items))
                    throw TypeError(".esp_control.NavBarDef.items: array expected");
                message.items = [];
                for (let i = 0; i < object.items.length; ++i) {
                    if (typeof object.items[i] !== "object")
                        throw TypeError(".esp_control.NavBarDef.items: object expected");
                    message.items[i] = $root.esp_control.NavBarItemDef.fromObject(object.items[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a NavBarDef message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.NavBarDef
         * @static
         * @param {esp_control.NavBarDef} message NavBarDef
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        NavBarDef.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.items = [];
            if (message.items && message.items.length) {
                object.items = [];
                for (let j = 0; j < message.items.length; ++j)
                    object.items[j] = $root.esp_control.NavBarItemDef.toObject(message.items[j], options);
            }
            return object;
        };

        /**
         * Converts this NavBarDef to JSON.
         * @function toJSON
         * @memberof esp_control.NavBarDef
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        NavBarDef.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for NavBarDef
         * @function getTypeUrl
         * @memberof esp_control.NavBarDef
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        NavBarDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.NavBarDef";
        };

        return NavBarDef;
    })();

    esp_control.AppShellDef = (function() {

        /**
         * Properties of an AppShellDef.
         * @memberof esp_control
         * @interface IAppShellDef
         * @property {esp_control.INavBarDef|null} [navBar] AppShellDef navBar
         */

        /**
         * Constructs a new AppShellDef.
         * @memberof esp_control
         * @classdesc Represents an AppShellDef.
         * @implements IAppShellDef
         * @constructor
         * @param {esp_control.IAppShellDef=} [properties] Properties to set
         */
        function AppShellDef(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AppShellDef navBar.
         * @member {esp_control.INavBarDef|null|undefined} navBar
         * @memberof esp_control.AppShellDef
         * @instance
         */
        AppShellDef.prototype.navBar = null;

        /**
         * Creates a new AppShellDef instance using the specified properties.
         * @function create
         * @memberof esp_control.AppShellDef
         * @static
         * @param {esp_control.IAppShellDef=} [properties] Properties to set
         * @returns {esp_control.AppShellDef} AppShellDef instance
         */
        AppShellDef.create = function create(properties) {
            return new AppShellDef(properties);
        };

        /**
         * Encodes the specified AppShellDef message. Does not implicitly {@link esp_control.AppShellDef.verify|verify} messages.
         * @function encode
         * @memberof esp_control.AppShellDef
         * @static
         * @param {esp_control.IAppShellDef} message AppShellDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AppShellDef.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.navBar != null && Object.hasOwnProperty.call(message, "navBar"))
                $root.esp_control.NavBarDef.encode(message.navBar, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AppShellDef message, length delimited. Does not implicitly {@link esp_control.AppShellDef.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.AppShellDef
         * @static
         * @param {esp_control.IAppShellDef} message AppShellDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AppShellDef.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AppShellDef message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.AppShellDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.AppShellDef} AppShellDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AppShellDef.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.AppShellDef();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.navBar = $root.esp_control.NavBarDef.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AppShellDef message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.AppShellDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.AppShellDef} AppShellDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AppShellDef.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AppShellDef message.
         * @function verify
         * @memberof esp_control.AppShellDef
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AppShellDef.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.navBar != null && message.hasOwnProperty("navBar")) {
                let error = $root.esp_control.NavBarDef.verify(message.navBar);
                if (error)
                    return "navBar." + error;
            }
            return null;
        };

        /**
         * Creates an AppShellDef message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.AppShellDef
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.AppShellDef} AppShellDef
         */
        AppShellDef.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.AppShellDef)
                return object;
            let message = new $root.esp_control.AppShellDef();
            if (object.navBar != null) {
                if (typeof object.navBar !== "object")
                    throw TypeError(".esp_control.AppShellDef.navBar: object expected");
                message.navBar = $root.esp_control.NavBarDef.fromObject(object.navBar);
            }
            return message;
        };

        /**
         * Creates a plain object from an AppShellDef message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.AppShellDef
         * @static
         * @param {esp_control.AppShellDef} message AppShellDef
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AppShellDef.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.navBar = null;
            if (message.navBar != null && message.hasOwnProperty("navBar"))
                object.navBar = $root.esp_control.NavBarDef.toObject(message.navBar, options);
            return object;
        };

        /**
         * Converts this AppShellDef to JSON.
         * @function toJSON
         * @memberof esp_control.AppShellDef
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AppShellDef.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for AppShellDef
         * @function getTypeUrl
         * @memberof esp_control.AppShellDef
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        AppShellDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.AppShellDef";
        };

        return AppShellDef;
    })();

    esp_control.BindingDef = (function() {

        /**
         * Properties of a BindingDef.
         * @memberof esp_control
         * @interface IBindingDef
         * @property {number|null} [resourceId] BindingDef resourceId
         * @property {number|null} [actionId] BindingDef actionId
         */

        /**
         * Constructs a new BindingDef.
         * @memberof esp_control
         * @classdesc Represents a BindingDef.
         * @implements IBindingDef
         * @constructor
         * @param {esp_control.IBindingDef=} [properties] Properties to set
         */
        function BindingDef(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BindingDef resourceId.
         * @member {number} resourceId
         * @memberof esp_control.BindingDef
         * @instance
         */
        BindingDef.prototype.resourceId = 0;

        /**
         * BindingDef actionId.
         * @member {number} actionId
         * @memberof esp_control.BindingDef
         * @instance
         */
        BindingDef.prototype.actionId = 0;

        /**
         * Creates a new BindingDef instance using the specified properties.
         * @function create
         * @memberof esp_control.BindingDef
         * @static
         * @param {esp_control.IBindingDef=} [properties] Properties to set
         * @returns {esp_control.BindingDef} BindingDef instance
         */
        BindingDef.create = function create(properties) {
            return new BindingDef(properties);
        };

        /**
         * Encodes the specified BindingDef message. Does not implicitly {@link esp_control.BindingDef.verify|verify} messages.
         * @function encode
         * @memberof esp_control.BindingDef
         * @static
         * @param {esp_control.IBindingDef} message BindingDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BindingDef.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.resourceId != null && Object.hasOwnProperty.call(message, "resourceId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.resourceId);
            if (message.actionId != null && Object.hasOwnProperty.call(message, "actionId"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.actionId);
            return writer;
        };

        /**
         * Encodes the specified BindingDef message, length delimited. Does not implicitly {@link esp_control.BindingDef.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.BindingDef
         * @static
         * @param {esp_control.IBindingDef} message BindingDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BindingDef.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BindingDef message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.BindingDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.BindingDef} BindingDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BindingDef.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.BindingDef();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.resourceId = reader.uint32();
                        break;
                    }
                case 2: {
                        message.actionId = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a BindingDef message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.BindingDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.BindingDef} BindingDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BindingDef.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BindingDef message.
         * @function verify
         * @memberof esp_control.BindingDef
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BindingDef.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.resourceId != null && message.hasOwnProperty("resourceId"))
                if (!$util.isInteger(message.resourceId))
                    return "resourceId: integer expected";
            if (message.actionId != null && message.hasOwnProperty("actionId"))
                if (!$util.isInteger(message.actionId))
                    return "actionId: integer expected";
            return null;
        };

        /**
         * Creates a BindingDef message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.BindingDef
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.BindingDef} BindingDef
         */
        BindingDef.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.BindingDef)
                return object;
            let message = new $root.esp_control.BindingDef();
            if (object.resourceId != null)
                message.resourceId = object.resourceId >>> 0;
            if (object.actionId != null)
                message.actionId = object.actionId >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a BindingDef message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.BindingDef
         * @static
         * @param {esp_control.BindingDef} message BindingDef
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BindingDef.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.resourceId = 0;
                object.actionId = 0;
            }
            if (message.resourceId != null && message.hasOwnProperty("resourceId"))
                object.resourceId = message.resourceId;
            if (message.actionId != null && message.hasOwnProperty("actionId"))
                object.actionId = message.actionId;
            return object;
        };

        /**
         * Converts this BindingDef to JSON.
         * @function toJSON
         * @memberof esp_control.BindingDef
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BindingDef.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for BindingDef
         * @function getTypeUrl
         * @memberof esp_control.BindingDef
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        BindingDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.BindingDef";
        };

        return BindingDef;
    })();

    esp_control.NodeDef = (function() {

        /**
         * Properties of a NodeDef.
         * @memberof esp_control
         * @interface INodeDef
         * @property {number|null} [id] NodeDef id
         * @property {number|null} [slugIdx] NodeDef slugIdx
         * @property {esp_control.NodeKind|null} [kind] NodeDef kind
         * @property {esp_control.WidgetKind|null} [widgetKind] NodeDef widgetKind
         * @property {number|null} [titleIdx] NodeDef titleIdx
         * @property {number|null} [toneIdx] NodeDef toneIdx
         * @property {Array.<number>|null} [childrenIds] NodeDef childrenIds
         * @property {number|null} [columns] NodeDef columns
         * @property {esp_control.IBindingDef|null} [bind] NodeDef bind
         * @property {esp_control.IRule|null} [visibleIf] NodeDef visibleIf
         * @property {esp_control.IRule|null} [enabledIf] NodeDef enabledIf
         * @property {number|null} [textIdx] NodeDef textIdx
         * @property {number|null} [formatHintIdx] NodeDef formatHintIdx
         */

        /**
         * Constructs a new NodeDef.
         * @memberof esp_control
         * @classdesc Represents a NodeDef.
         * @implements INodeDef
         * @constructor
         * @param {esp_control.INodeDef=} [properties] Properties to set
         */
        function NodeDef(properties) {
            this.childrenIds = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * NodeDef id.
         * @member {number} id
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.id = 0;

        /**
         * NodeDef slugIdx.
         * @member {number} slugIdx
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.slugIdx = 0;

        /**
         * NodeDef kind.
         * @member {esp_control.NodeKind} kind
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.kind = 0;

        /**
         * NodeDef widgetKind.
         * @member {esp_control.WidgetKind} widgetKind
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.widgetKind = 0;

        /**
         * NodeDef titleIdx.
         * @member {number} titleIdx
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.titleIdx = 0;

        /**
         * NodeDef toneIdx.
         * @member {number} toneIdx
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.toneIdx = 0;

        /**
         * NodeDef childrenIds.
         * @member {Array.<number>} childrenIds
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.childrenIds = $util.emptyArray;

        /**
         * NodeDef columns.
         * @member {number} columns
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.columns = 0;

        /**
         * NodeDef bind.
         * @member {esp_control.IBindingDef|null|undefined} bind
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.bind = null;

        /**
         * NodeDef visibleIf.
         * @member {esp_control.IRule|null|undefined} visibleIf
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.visibleIf = null;

        /**
         * NodeDef enabledIf.
         * @member {esp_control.IRule|null|undefined} enabledIf
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.enabledIf = null;

        /**
         * NodeDef textIdx.
         * @member {number} textIdx
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.textIdx = 0;

        /**
         * NodeDef formatHintIdx.
         * @member {number} formatHintIdx
         * @memberof esp_control.NodeDef
         * @instance
         */
        NodeDef.prototype.formatHintIdx = 0;

        /**
         * Creates a new NodeDef instance using the specified properties.
         * @function create
         * @memberof esp_control.NodeDef
         * @static
         * @param {esp_control.INodeDef=} [properties] Properties to set
         * @returns {esp_control.NodeDef} NodeDef instance
         */
        NodeDef.create = function create(properties) {
            return new NodeDef(properties);
        };

        /**
         * Encodes the specified NodeDef message. Does not implicitly {@link esp_control.NodeDef.verify|verify} messages.
         * @function encode
         * @memberof esp_control.NodeDef
         * @static
         * @param {esp_control.INodeDef} message NodeDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NodeDef.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
            if (message.slugIdx != null && Object.hasOwnProperty.call(message, "slugIdx"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.slugIdx);
            if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.kind);
            if (message.widgetKind != null && Object.hasOwnProperty.call(message, "widgetKind"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.widgetKind);
            if (message.titleIdx != null && Object.hasOwnProperty.call(message, "titleIdx"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.titleIdx);
            if (message.toneIdx != null && Object.hasOwnProperty.call(message, "toneIdx"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.toneIdx);
            if (message.childrenIds != null && message.childrenIds.length) {
                writer.uint32(/* id 7, wireType 2 =*/58).fork();
                for (let i = 0; i < message.childrenIds.length; ++i)
                    writer.uint32(message.childrenIds[i]);
                writer.ldelim();
            }
            if (message.columns != null && Object.hasOwnProperty.call(message, "columns"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.columns);
            if (message.bind != null && Object.hasOwnProperty.call(message, "bind"))
                $root.esp_control.BindingDef.encode(message.bind, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.visibleIf != null && Object.hasOwnProperty.call(message, "visibleIf"))
                $root.esp_control.Rule.encode(message.visibleIf, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.enabledIf != null && Object.hasOwnProperty.call(message, "enabledIf"))
                $root.esp_control.Rule.encode(message.enabledIf, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.textIdx != null && Object.hasOwnProperty.call(message, "textIdx"))
                writer.uint32(/* id 12, wireType 0 =*/96).uint32(message.textIdx);
            if (message.formatHintIdx != null && Object.hasOwnProperty.call(message, "formatHintIdx"))
                writer.uint32(/* id 13, wireType 0 =*/104).uint32(message.formatHintIdx);
            return writer;
        };

        /**
         * Encodes the specified NodeDef message, length delimited. Does not implicitly {@link esp_control.NodeDef.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.NodeDef
         * @static
         * @param {esp_control.INodeDef} message NodeDef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NodeDef.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a NodeDef message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.NodeDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.NodeDef} NodeDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NodeDef.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.NodeDef();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint32();
                        break;
                    }
                case 2: {
                        message.slugIdx = reader.uint32();
                        break;
                    }
                case 3: {
                        message.kind = reader.int32();
                        break;
                    }
                case 4: {
                        message.widgetKind = reader.int32();
                        break;
                    }
                case 5: {
                        message.titleIdx = reader.uint32();
                        break;
                    }
                case 6: {
                        message.toneIdx = reader.uint32();
                        break;
                    }
                case 7: {
                        if (!(message.childrenIds && message.childrenIds.length))
                            message.childrenIds = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.childrenIds.push(reader.uint32());
                        } else
                            message.childrenIds.push(reader.uint32());
                        break;
                    }
                case 8: {
                        message.columns = reader.uint32();
                        break;
                    }
                case 9: {
                        message.bind = $root.esp_control.BindingDef.decode(reader, reader.uint32());
                        break;
                    }
                case 10: {
                        message.visibleIf = $root.esp_control.Rule.decode(reader, reader.uint32());
                        break;
                    }
                case 11: {
                        message.enabledIf = $root.esp_control.Rule.decode(reader, reader.uint32());
                        break;
                    }
                case 12: {
                        message.textIdx = reader.uint32();
                        break;
                    }
                case 13: {
                        message.formatHintIdx = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a NodeDef message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.NodeDef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.NodeDef} NodeDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NodeDef.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a NodeDef message.
         * @function verify
         * @memberof esp_control.NodeDef
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        NodeDef.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.slugIdx != null && message.hasOwnProperty("slugIdx"))
                if (!$util.isInteger(message.slugIdx))
                    return "slugIdx: integer expected";
            if (message.kind != null && message.hasOwnProperty("kind"))
                switch (message.kind) {
                default:
                    return "kind: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                }
            if (message.widgetKind != null && message.hasOwnProperty("widgetKind"))
                switch (message.widgetKind) {
                default:
                    return "widgetKind: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    break;
                }
            if (message.titleIdx != null && message.hasOwnProperty("titleIdx"))
                if (!$util.isInteger(message.titleIdx))
                    return "titleIdx: integer expected";
            if (message.toneIdx != null && message.hasOwnProperty("toneIdx"))
                if (!$util.isInteger(message.toneIdx))
                    return "toneIdx: integer expected";
            if (message.childrenIds != null && message.hasOwnProperty("childrenIds")) {
                if (!Array.isArray(message.childrenIds))
                    return "childrenIds: array expected";
                for (let i = 0; i < message.childrenIds.length; ++i)
                    if (!$util.isInteger(message.childrenIds[i]))
                        return "childrenIds: integer[] expected";
            }
            if (message.columns != null && message.hasOwnProperty("columns"))
                if (!$util.isInteger(message.columns))
                    return "columns: integer expected";
            if (message.bind != null && message.hasOwnProperty("bind")) {
                let error = $root.esp_control.BindingDef.verify(message.bind);
                if (error)
                    return "bind." + error;
            }
            if (message.visibleIf != null && message.hasOwnProperty("visibleIf")) {
                let error = $root.esp_control.Rule.verify(message.visibleIf);
                if (error)
                    return "visibleIf." + error;
            }
            if (message.enabledIf != null && message.hasOwnProperty("enabledIf")) {
                let error = $root.esp_control.Rule.verify(message.enabledIf);
                if (error)
                    return "enabledIf." + error;
            }
            if (message.textIdx != null && message.hasOwnProperty("textIdx"))
                if (!$util.isInteger(message.textIdx))
                    return "textIdx: integer expected";
            if (message.formatHintIdx != null && message.hasOwnProperty("formatHintIdx"))
                if (!$util.isInteger(message.formatHintIdx))
                    return "formatHintIdx: integer expected";
            return null;
        };

        /**
         * Creates a NodeDef message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.NodeDef
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.NodeDef} NodeDef
         */
        NodeDef.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.NodeDef)
                return object;
            let message = new $root.esp_control.NodeDef();
            if (object.id != null)
                message.id = object.id >>> 0;
            if (object.slugIdx != null)
                message.slugIdx = object.slugIdx >>> 0;
            switch (object.kind) {
            default:
                if (typeof object.kind === "number") {
                    message.kind = object.kind;
                    break;
                }
                break;
            case "NODE_KIND_UNSPECIFIED":
            case 0:
                message.kind = 0;
                break;
            case "NODE_KIND_STACK":
            case 1:
                message.kind = 1;
                break;
            case "NODE_KIND_ROW":
            case 2:
                message.kind = 2;
                break;
            case "NODE_KIND_GRID":
            case 3:
                message.kind = 3;
                break;
            case "NODE_KIND_SECTION":
            case 4:
                message.kind = 4;
                break;
            case "NODE_KIND_WIDGET":
            case 5:
                message.kind = 5;
                break;
            }
            switch (object.widgetKind) {
            default:
                if (typeof object.widgetKind === "number") {
                    message.widgetKind = object.widgetKind;
                    break;
                }
                break;
            case "WIDGET_KIND_UNSPECIFIED":
            case 0:
                message.widgetKind = 0;
                break;
            case "WIDGET_KIND_TEXT":
            case 1:
                message.widgetKind = 1;
                break;
            case "WIDGET_KIND_STAT":
            case 2:
                message.widgetKind = 2;
                break;
            case "WIDGET_KIND_TOGGLE":
            case 3:
                message.widgetKind = 3;
                break;
            case "WIDGET_KIND_BUTTON":
            case 4:
                message.widgetKind = 4;
                break;
            case "WIDGET_KIND_SLIDER":
            case 5:
                message.widgetKind = 5;
                break;
            case "WIDGET_KIND_SELECT":
            case 6:
                message.widgetKind = 6;
                break;
            case "WIDGET_KIND_TEXT_INPUT":
            case 7:
                message.widgetKind = 7;
                break;
            case "WIDGET_KIND_BADGE":
            case 8:
                message.widgetKind = 8;
                break;
            case "WIDGET_KIND_PROGRESS":
            case 9:
                message.widgetKind = 9;
                break;
            case "WIDGET_KIND_TIMER":
            case 10:
                message.widgetKind = 10;
                break;
            }
            if (object.titleIdx != null)
                message.titleIdx = object.titleIdx >>> 0;
            if (object.toneIdx != null)
                message.toneIdx = object.toneIdx >>> 0;
            if (object.childrenIds) {
                if (!Array.isArray(object.childrenIds))
                    throw TypeError(".esp_control.NodeDef.childrenIds: array expected");
                message.childrenIds = [];
                for (let i = 0; i < object.childrenIds.length; ++i)
                    message.childrenIds[i] = object.childrenIds[i] >>> 0;
            }
            if (object.columns != null)
                message.columns = object.columns >>> 0;
            if (object.bind != null) {
                if (typeof object.bind !== "object")
                    throw TypeError(".esp_control.NodeDef.bind: object expected");
                message.bind = $root.esp_control.BindingDef.fromObject(object.bind);
            }
            if (object.visibleIf != null) {
                if (typeof object.visibleIf !== "object")
                    throw TypeError(".esp_control.NodeDef.visibleIf: object expected");
                message.visibleIf = $root.esp_control.Rule.fromObject(object.visibleIf);
            }
            if (object.enabledIf != null) {
                if (typeof object.enabledIf !== "object")
                    throw TypeError(".esp_control.NodeDef.enabledIf: object expected");
                message.enabledIf = $root.esp_control.Rule.fromObject(object.enabledIf);
            }
            if (object.textIdx != null)
                message.textIdx = object.textIdx >>> 0;
            if (object.formatHintIdx != null)
                message.formatHintIdx = object.formatHintIdx >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a NodeDef message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.NodeDef
         * @static
         * @param {esp_control.NodeDef} message NodeDef
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        NodeDef.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.childrenIds = [];
            if (options.defaults) {
                object.id = 0;
                object.slugIdx = 0;
                object.kind = options.enums === String ? "NODE_KIND_UNSPECIFIED" : 0;
                object.widgetKind = options.enums === String ? "WIDGET_KIND_UNSPECIFIED" : 0;
                object.titleIdx = 0;
                object.toneIdx = 0;
                object.columns = 0;
                object.bind = null;
                object.visibleIf = null;
                object.enabledIf = null;
                object.textIdx = 0;
                object.formatHintIdx = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.slugIdx != null && message.hasOwnProperty("slugIdx"))
                object.slugIdx = message.slugIdx;
            if (message.kind != null && message.hasOwnProperty("kind"))
                object.kind = options.enums === String ? $root.esp_control.NodeKind[message.kind] === undefined ? message.kind : $root.esp_control.NodeKind[message.kind] : message.kind;
            if (message.widgetKind != null && message.hasOwnProperty("widgetKind"))
                object.widgetKind = options.enums === String ? $root.esp_control.WidgetKind[message.widgetKind] === undefined ? message.widgetKind : $root.esp_control.WidgetKind[message.widgetKind] : message.widgetKind;
            if (message.titleIdx != null && message.hasOwnProperty("titleIdx"))
                object.titleIdx = message.titleIdx;
            if (message.toneIdx != null && message.hasOwnProperty("toneIdx"))
                object.toneIdx = message.toneIdx;
            if (message.childrenIds && message.childrenIds.length) {
                object.childrenIds = [];
                for (let j = 0; j < message.childrenIds.length; ++j)
                    object.childrenIds[j] = message.childrenIds[j];
            }
            if (message.columns != null && message.hasOwnProperty("columns"))
                object.columns = message.columns;
            if (message.bind != null && message.hasOwnProperty("bind"))
                object.bind = $root.esp_control.BindingDef.toObject(message.bind, options);
            if (message.visibleIf != null && message.hasOwnProperty("visibleIf"))
                object.visibleIf = $root.esp_control.Rule.toObject(message.visibleIf, options);
            if (message.enabledIf != null && message.hasOwnProperty("enabledIf"))
                object.enabledIf = $root.esp_control.Rule.toObject(message.enabledIf, options);
            if (message.textIdx != null && message.hasOwnProperty("textIdx"))
                object.textIdx = message.textIdx;
            if (message.formatHintIdx != null && message.hasOwnProperty("formatHintIdx"))
                object.formatHintIdx = message.formatHintIdx;
            return object;
        };

        /**
         * Converts this NodeDef to JSON.
         * @function toJSON
         * @memberof esp_control.NodeDef
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        NodeDef.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for NodeDef
         * @function getTypeUrl
         * @memberof esp_control.NodeDef
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        NodeDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.NodeDef";
        };

        return NodeDef;
    })();

    esp_control.ManifestBundle = (function() {

        /**
         * Properties of a ManifestBundle.
         * @memberof esp_control
         * @interface IManifestBundle
         * @property {number|null} [version] ManifestBundle version
         * @property {number|null} [schemaVersion] ManifestBundle schemaVersion
         * @property {string|null} [minAppVersion] ManifestBundle minAppVersion
         * @property {esp_control.ICapabilitiesDef|null} [capabilities] ManifestBundle capabilities
         * @property {Array.<esp_control.IStringEntry>|null} [strings] ManifestBundle strings
         * @property {Array.<esp_control.IResourceDef>|null} [resources] ManifestBundle resources
         * @property {Array.<esp_control.IActionDef>|null} [actions] ManifestBundle actions
         * @property {Array.<esp_control.IScreenDef>|null} [screens] ManifestBundle screens
         * @property {Array.<esp_control.INodeDef>|null} [nodes] ManifestBundle nodes
         * @property {esp_control.IAppShellDef|null} [appShell] ManifestBundle appShell
         */

        /**
         * Constructs a new ManifestBundle.
         * @memberof esp_control
         * @classdesc Represents a ManifestBundle.
         * @implements IManifestBundle
         * @constructor
         * @param {esp_control.IManifestBundle=} [properties] Properties to set
         */
        function ManifestBundle(properties) {
            this.strings = [];
            this.resources = [];
            this.actions = [];
            this.screens = [];
            this.nodes = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ManifestBundle version.
         * @member {number} version
         * @memberof esp_control.ManifestBundle
         * @instance
         */
        ManifestBundle.prototype.version = 0;

        /**
         * ManifestBundle schemaVersion.
         * @member {number} schemaVersion
         * @memberof esp_control.ManifestBundle
         * @instance
         */
        ManifestBundle.prototype.schemaVersion = 0;

        /**
         * ManifestBundle minAppVersion.
         * @member {string} minAppVersion
         * @memberof esp_control.ManifestBundle
         * @instance
         */
        ManifestBundle.prototype.minAppVersion = "";

        /**
         * ManifestBundle capabilities.
         * @member {esp_control.ICapabilitiesDef|null|undefined} capabilities
         * @memberof esp_control.ManifestBundle
         * @instance
         */
        ManifestBundle.prototype.capabilities = null;

        /**
         * ManifestBundle strings.
         * @member {Array.<esp_control.IStringEntry>} strings
         * @memberof esp_control.ManifestBundle
         * @instance
         */
        ManifestBundle.prototype.strings = $util.emptyArray;

        /**
         * ManifestBundle resources.
         * @member {Array.<esp_control.IResourceDef>} resources
         * @memberof esp_control.ManifestBundle
         * @instance
         */
        ManifestBundle.prototype.resources = $util.emptyArray;

        /**
         * ManifestBundle actions.
         * @member {Array.<esp_control.IActionDef>} actions
         * @memberof esp_control.ManifestBundle
         * @instance
         */
        ManifestBundle.prototype.actions = $util.emptyArray;

        /**
         * ManifestBundle screens.
         * @member {Array.<esp_control.IScreenDef>} screens
         * @memberof esp_control.ManifestBundle
         * @instance
         */
        ManifestBundle.prototype.screens = $util.emptyArray;

        /**
         * ManifestBundle nodes.
         * @member {Array.<esp_control.INodeDef>} nodes
         * @memberof esp_control.ManifestBundle
         * @instance
         */
        ManifestBundle.prototype.nodes = $util.emptyArray;

        /**
         * ManifestBundle appShell.
         * @member {esp_control.IAppShellDef|null|undefined} appShell
         * @memberof esp_control.ManifestBundle
         * @instance
         */
        ManifestBundle.prototype.appShell = null;

        /**
         * Creates a new ManifestBundle instance using the specified properties.
         * @function create
         * @memberof esp_control.ManifestBundle
         * @static
         * @param {esp_control.IManifestBundle=} [properties] Properties to set
         * @returns {esp_control.ManifestBundle} ManifestBundle instance
         */
        ManifestBundle.create = function create(properties) {
            return new ManifestBundle(properties);
        };

        /**
         * Encodes the specified ManifestBundle message. Does not implicitly {@link esp_control.ManifestBundle.verify|verify} messages.
         * @function encode
         * @memberof esp_control.ManifestBundle
         * @static
         * @param {esp_control.IManifestBundle} message ManifestBundle message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ManifestBundle.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.version);
            if (message.schemaVersion != null && Object.hasOwnProperty.call(message, "schemaVersion"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.schemaVersion);
            if (message.minAppVersion != null && Object.hasOwnProperty.call(message, "minAppVersion"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.minAppVersion);
            if (message.capabilities != null && Object.hasOwnProperty.call(message, "capabilities"))
                $root.esp_control.CapabilitiesDef.encode(message.capabilities, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.strings != null && message.strings.length)
                for (let i = 0; i < message.strings.length; ++i)
                    $root.esp_control.StringEntry.encode(message.strings[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.resources != null && message.resources.length)
                for (let i = 0; i < message.resources.length; ++i)
                    $root.esp_control.ResourceDef.encode(message.resources[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.actions != null && message.actions.length)
                for (let i = 0; i < message.actions.length; ++i)
                    $root.esp_control.ActionDef.encode(message.actions[i], writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.screens != null && message.screens.length)
                for (let i = 0; i < message.screens.length; ++i)
                    $root.esp_control.ScreenDef.encode(message.screens[i], writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.nodes != null && message.nodes.length)
                for (let i = 0; i < message.nodes.length; ++i)
                    $root.esp_control.NodeDef.encode(message.nodes[i], writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.appShell != null && Object.hasOwnProperty.call(message, "appShell"))
                $root.esp_control.AppShellDef.encode(message.appShell, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ManifestBundle message, length delimited. Does not implicitly {@link esp_control.ManifestBundle.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.ManifestBundle
         * @static
         * @param {esp_control.IManifestBundle} message ManifestBundle message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ManifestBundle.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ManifestBundle message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.ManifestBundle
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.ManifestBundle} ManifestBundle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ManifestBundle.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.ManifestBundle();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.version = reader.uint32();
                        break;
                    }
                case 2: {
                        message.schemaVersion = reader.uint32();
                        break;
                    }
                case 3: {
                        message.minAppVersion = reader.string();
                        break;
                    }
                case 4: {
                        message.capabilities = $root.esp_control.CapabilitiesDef.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        if (!(message.strings && message.strings.length))
                            message.strings = [];
                        message.strings.push($root.esp_control.StringEntry.decode(reader, reader.uint32()));
                        break;
                    }
                case 6: {
                        if (!(message.resources && message.resources.length))
                            message.resources = [];
                        message.resources.push($root.esp_control.ResourceDef.decode(reader, reader.uint32()));
                        break;
                    }
                case 7: {
                        if (!(message.actions && message.actions.length))
                            message.actions = [];
                        message.actions.push($root.esp_control.ActionDef.decode(reader, reader.uint32()));
                        break;
                    }
                case 8: {
                        if (!(message.screens && message.screens.length))
                            message.screens = [];
                        message.screens.push($root.esp_control.ScreenDef.decode(reader, reader.uint32()));
                        break;
                    }
                case 9: {
                        if (!(message.nodes && message.nodes.length))
                            message.nodes = [];
                        message.nodes.push($root.esp_control.NodeDef.decode(reader, reader.uint32()));
                        break;
                    }
                case 10: {
                        message.appShell = $root.esp_control.AppShellDef.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ManifestBundle message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.ManifestBundle
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.ManifestBundle} ManifestBundle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ManifestBundle.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ManifestBundle message.
         * @function verify
         * @memberof esp_control.ManifestBundle
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ManifestBundle.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isInteger(message.version))
                    return "version: integer expected";
            if (message.schemaVersion != null && message.hasOwnProperty("schemaVersion"))
                if (!$util.isInteger(message.schemaVersion))
                    return "schemaVersion: integer expected";
            if (message.minAppVersion != null && message.hasOwnProperty("minAppVersion"))
                if (!$util.isString(message.minAppVersion))
                    return "minAppVersion: string expected";
            if (message.capabilities != null && message.hasOwnProperty("capabilities")) {
                let error = $root.esp_control.CapabilitiesDef.verify(message.capabilities);
                if (error)
                    return "capabilities." + error;
            }
            if (message.strings != null && message.hasOwnProperty("strings")) {
                if (!Array.isArray(message.strings))
                    return "strings: array expected";
                for (let i = 0; i < message.strings.length; ++i) {
                    let error = $root.esp_control.StringEntry.verify(message.strings[i]);
                    if (error)
                        return "strings." + error;
                }
            }
            if (message.resources != null && message.hasOwnProperty("resources")) {
                if (!Array.isArray(message.resources))
                    return "resources: array expected";
                for (let i = 0; i < message.resources.length; ++i) {
                    let error = $root.esp_control.ResourceDef.verify(message.resources[i]);
                    if (error)
                        return "resources." + error;
                }
            }
            if (message.actions != null && message.hasOwnProperty("actions")) {
                if (!Array.isArray(message.actions))
                    return "actions: array expected";
                for (let i = 0; i < message.actions.length; ++i) {
                    let error = $root.esp_control.ActionDef.verify(message.actions[i]);
                    if (error)
                        return "actions." + error;
                }
            }
            if (message.screens != null && message.hasOwnProperty("screens")) {
                if (!Array.isArray(message.screens))
                    return "screens: array expected";
                for (let i = 0; i < message.screens.length; ++i) {
                    let error = $root.esp_control.ScreenDef.verify(message.screens[i]);
                    if (error)
                        return "screens." + error;
                }
            }
            if (message.nodes != null && message.hasOwnProperty("nodes")) {
                if (!Array.isArray(message.nodes))
                    return "nodes: array expected";
                for (let i = 0; i < message.nodes.length; ++i) {
                    let error = $root.esp_control.NodeDef.verify(message.nodes[i]);
                    if (error)
                        return "nodes." + error;
                }
            }
            if (message.appShell != null && message.hasOwnProperty("appShell")) {
                let error = $root.esp_control.AppShellDef.verify(message.appShell);
                if (error)
                    return "appShell." + error;
            }
            return null;
        };

        /**
         * Creates a ManifestBundle message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.ManifestBundle
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.ManifestBundle} ManifestBundle
         */
        ManifestBundle.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.ManifestBundle)
                return object;
            let message = new $root.esp_control.ManifestBundle();
            if (object.version != null)
                message.version = object.version >>> 0;
            if (object.schemaVersion != null)
                message.schemaVersion = object.schemaVersion >>> 0;
            if (object.minAppVersion != null)
                message.minAppVersion = String(object.minAppVersion);
            if (object.capabilities != null) {
                if (typeof object.capabilities !== "object")
                    throw TypeError(".esp_control.ManifestBundle.capabilities: object expected");
                message.capabilities = $root.esp_control.CapabilitiesDef.fromObject(object.capabilities);
            }
            if (object.strings) {
                if (!Array.isArray(object.strings))
                    throw TypeError(".esp_control.ManifestBundle.strings: array expected");
                message.strings = [];
                for (let i = 0; i < object.strings.length; ++i) {
                    if (typeof object.strings[i] !== "object")
                        throw TypeError(".esp_control.ManifestBundle.strings: object expected");
                    message.strings[i] = $root.esp_control.StringEntry.fromObject(object.strings[i]);
                }
            }
            if (object.resources) {
                if (!Array.isArray(object.resources))
                    throw TypeError(".esp_control.ManifestBundle.resources: array expected");
                message.resources = [];
                for (let i = 0; i < object.resources.length; ++i) {
                    if (typeof object.resources[i] !== "object")
                        throw TypeError(".esp_control.ManifestBundle.resources: object expected");
                    message.resources[i] = $root.esp_control.ResourceDef.fromObject(object.resources[i]);
                }
            }
            if (object.actions) {
                if (!Array.isArray(object.actions))
                    throw TypeError(".esp_control.ManifestBundle.actions: array expected");
                message.actions = [];
                for (let i = 0; i < object.actions.length; ++i) {
                    if (typeof object.actions[i] !== "object")
                        throw TypeError(".esp_control.ManifestBundle.actions: object expected");
                    message.actions[i] = $root.esp_control.ActionDef.fromObject(object.actions[i]);
                }
            }
            if (object.screens) {
                if (!Array.isArray(object.screens))
                    throw TypeError(".esp_control.ManifestBundle.screens: array expected");
                message.screens = [];
                for (let i = 0; i < object.screens.length; ++i) {
                    if (typeof object.screens[i] !== "object")
                        throw TypeError(".esp_control.ManifestBundle.screens: object expected");
                    message.screens[i] = $root.esp_control.ScreenDef.fromObject(object.screens[i]);
                }
            }
            if (object.nodes) {
                if (!Array.isArray(object.nodes))
                    throw TypeError(".esp_control.ManifestBundle.nodes: array expected");
                message.nodes = [];
                for (let i = 0; i < object.nodes.length; ++i) {
                    if (typeof object.nodes[i] !== "object")
                        throw TypeError(".esp_control.ManifestBundle.nodes: object expected");
                    message.nodes[i] = $root.esp_control.NodeDef.fromObject(object.nodes[i]);
                }
            }
            if (object.appShell != null) {
                if (typeof object.appShell !== "object")
                    throw TypeError(".esp_control.ManifestBundle.appShell: object expected");
                message.appShell = $root.esp_control.AppShellDef.fromObject(object.appShell);
            }
            return message;
        };

        /**
         * Creates a plain object from a ManifestBundle message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.ManifestBundle
         * @static
         * @param {esp_control.ManifestBundle} message ManifestBundle
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ManifestBundle.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.strings = [];
                object.resources = [];
                object.actions = [];
                object.screens = [];
                object.nodes = [];
            }
            if (options.defaults) {
                object.version = 0;
                object.schemaVersion = 0;
                object.minAppVersion = "";
                object.capabilities = null;
                object.appShell = null;
            }
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            if (message.schemaVersion != null && message.hasOwnProperty("schemaVersion"))
                object.schemaVersion = message.schemaVersion;
            if (message.minAppVersion != null && message.hasOwnProperty("minAppVersion"))
                object.minAppVersion = message.minAppVersion;
            if (message.capabilities != null && message.hasOwnProperty("capabilities"))
                object.capabilities = $root.esp_control.CapabilitiesDef.toObject(message.capabilities, options);
            if (message.strings && message.strings.length) {
                object.strings = [];
                for (let j = 0; j < message.strings.length; ++j)
                    object.strings[j] = $root.esp_control.StringEntry.toObject(message.strings[j], options);
            }
            if (message.resources && message.resources.length) {
                object.resources = [];
                for (let j = 0; j < message.resources.length; ++j)
                    object.resources[j] = $root.esp_control.ResourceDef.toObject(message.resources[j], options);
            }
            if (message.actions && message.actions.length) {
                object.actions = [];
                for (let j = 0; j < message.actions.length; ++j)
                    object.actions[j] = $root.esp_control.ActionDef.toObject(message.actions[j], options);
            }
            if (message.screens && message.screens.length) {
                object.screens = [];
                for (let j = 0; j < message.screens.length; ++j)
                    object.screens[j] = $root.esp_control.ScreenDef.toObject(message.screens[j], options);
            }
            if (message.nodes && message.nodes.length) {
                object.nodes = [];
                for (let j = 0; j < message.nodes.length; ++j)
                    object.nodes[j] = $root.esp_control.NodeDef.toObject(message.nodes[j], options);
            }
            if (message.appShell != null && message.hasOwnProperty("appShell"))
                object.appShell = $root.esp_control.AppShellDef.toObject(message.appShell, options);
            return object;
        };

        /**
         * Converts this ManifestBundle to JSON.
         * @function toJSON
         * @memberof esp_control.ManifestBundle
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ManifestBundle.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ManifestBundle
         * @function getTypeUrl
         * @memberof esp_control.ManifestBundle
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ManifestBundle.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.ManifestBundle";
        };

        return ManifestBundle;
    })();

    /**
     * Status enum.
     * @name esp_control.Status
     * @enum {number}
     * @property {number} STATUS_UNSPECIFIED=0 STATUS_UNSPECIFIED value
     * @property {number} STATUS_OK=1 STATUS_OK value
     * @property {number} STATUS_BAD_PAYLOAD=2 STATUS_BAD_PAYLOAD value
     * @property {number} STATUS_UNKNOWN_ACTION=3 STATUS_UNKNOWN_ACTION value
     * @property {number} STATUS_UNAUTHORIZED=4 STATUS_UNAUTHORIZED value
     * @property {number} STATUS_INTERNAL=5 STATUS_INTERNAL value
     */
    esp_control.Status = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "STATUS_UNSPECIFIED"] = 0;
        values[valuesById[1] = "STATUS_OK"] = 1;
        values[valuesById[2] = "STATUS_BAD_PAYLOAD"] = 2;
        values[valuesById[3] = "STATUS_UNKNOWN_ACTION"] = 3;
        values[valuesById[4] = "STATUS_UNAUTHORIZED"] = 4;
        values[valuesById[5] = "STATUS_INTERNAL"] = 5;
        return values;
    })();

    esp_control.ResourceValue = (function() {

        /**
         * Properties of a ResourceValue.
         * @memberof esp_control
         * @interface IResourceValue
         * @property {number|null} [resourceId] ResourceValue resourceId
         * @property {esp_control.ICommonValue|null} [value] ResourceValue value
         */

        /**
         * Constructs a new ResourceValue.
         * @memberof esp_control
         * @classdesc Represents a ResourceValue.
         * @implements IResourceValue
         * @constructor
         * @param {esp_control.IResourceValue=} [properties] Properties to set
         */
        function ResourceValue(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ResourceValue resourceId.
         * @member {number} resourceId
         * @memberof esp_control.ResourceValue
         * @instance
         */
        ResourceValue.prototype.resourceId = 0;

        /**
         * ResourceValue value.
         * @member {esp_control.ICommonValue|null|undefined} value
         * @memberof esp_control.ResourceValue
         * @instance
         */
        ResourceValue.prototype.value = null;

        /**
         * Creates a new ResourceValue instance using the specified properties.
         * @function create
         * @memberof esp_control.ResourceValue
         * @static
         * @param {esp_control.IResourceValue=} [properties] Properties to set
         * @returns {esp_control.ResourceValue} ResourceValue instance
         */
        ResourceValue.create = function create(properties) {
            return new ResourceValue(properties);
        };

        /**
         * Encodes the specified ResourceValue message. Does not implicitly {@link esp_control.ResourceValue.verify|verify} messages.
         * @function encode
         * @memberof esp_control.ResourceValue
         * @static
         * @param {esp_control.IResourceValue} message ResourceValue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResourceValue.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.resourceId != null && Object.hasOwnProperty.call(message, "resourceId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.resourceId);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                $root.esp_control.CommonValue.encode(message.value, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ResourceValue message, length delimited. Does not implicitly {@link esp_control.ResourceValue.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.ResourceValue
         * @static
         * @param {esp_control.IResourceValue} message ResourceValue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResourceValue.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ResourceValue message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.ResourceValue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.ResourceValue} ResourceValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResourceValue.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.ResourceValue();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.resourceId = reader.uint32();
                        break;
                    }
                case 2: {
                        message.value = $root.esp_control.CommonValue.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ResourceValue message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.ResourceValue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.ResourceValue} ResourceValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResourceValue.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ResourceValue message.
         * @function verify
         * @memberof esp_control.ResourceValue
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ResourceValue.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.resourceId != null && message.hasOwnProperty("resourceId"))
                if (!$util.isInteger(message.resourceId))
                    return "resourceId: integer expected";
            if (message.value != null && message.hasOwnProperty("value")) {
                let error = $root.esp_control.CommonValue.verify(message.value);
                if (error)
                    return "value." + error;
            }
            return null;
        };

        /**
         * Creates a ResourceValue message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.ResourceValue
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.ResourceValue} ResourceValue
         */
        ResourceValue.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.ResourceValue)
                return object;
            let message = new $root.esp_control.ResourceValue();
            if (object.resourceId != null)
                message.resourceId = object.resourceId >>> 0;
            if (object.value != null) {
                if (typeof object.value !== "object")
                    throw TypeError(".esp_control.ResourceValue.value: object expected");
                message.value = $root.esp_control.CommonValue.fromObject(object.value);
            }
            return message;
        };

        /**
         * Creates a plain object from a ResourceValue message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.ResourceValue
         * @static
         * @param {esp_control.ResourceValue} message ResourceValue
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ResourceValue.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.resourceId = 0;
                object.value = null;
            }
            if (message.resourceId != null && message.hasOwnProperty("resourceId"))
                object.resourceId = message.resourceId;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = $root.esp_control.CommonValue.toObject(message.value, options);
            return object;
        };

        /**
         * Converts this ResourceValue to JSON.
         * @function toJSON
         * @memberof esp_control.ResourceValue
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ResourceValue.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ResourceValue
         * @function getTypeUrl
         * @memberof esp_control.ResourceValue
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ResourceValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.ResourceValue";
        };

        return ResourceValue;
    })();

    esp_control.ResourceSnapshot = (function() {

        /**
         * Properties of a ResourceSnapshot.
         * @memberof esp_control
         * @interface IResourceSnapshot
         * @property {Array.<esp_control.IResourceValue>|null} [values] ResourceSnapshot values
         * @property {number|null} [generation] ResourceSnapshot generation
         */

        /**
         * Constructs a new ResourceSnapshot.
         * @memberof esp_control
         * @classdesc Represents a ResourceSnapshot.
         * @implements IResourceSnapshot
         * @constructor
         * @param {esp_control.IResourceSnapshot=} [properties] Properties to set
         */
        function ResourceSnapshot(properties) {
            this.values = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ResourceSnapshot values.
         * @member {Array.<esp_control.IResourceValue>} values
         * @memberof esp_control.ResourceSnapshot
         * @instance
         */
        ResourceSnapshot.prototype.values = $util.emptyArray;

        /**
         * ResourceSnapshot generation.
         * @member {number} generation
         * @memberof esp_control.ResourceSnapshot
         * @instance
         */
        ResourceSnapshot.prototype.generation = 0;

        /**
         * Creates a new ResourceSnapshot instance using the specified properties.
         * @function create
         * @memberof esp_control.ResourceSnapshot
         * @static
         * @param {esp_control.IResourceSnapshot=} [properties] Properties to set
         * @returns {esp_control.ResourceSnapshot} ResourceSnapshot instance
         */
        ResourceSnapshot.create = function create(properties) {
            return new ResourceSnapshot(properties);
        };

        /**
         * Encodes the specified ResourceSnapshot message. Does not implicitly {@link esp_control.ResourceSnapshot.verify|verify} messages.
         * @function encode
         * @memberof esp_control.ResourceSnapshot
         * @static
         * @param {esp_control.IResourceSnapshot} message ResourceSnapshot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResourceSnapshot.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.values != null && message.values.length)
                for (let i = 0; i < message.values.length; ++i)
                    $root.esp_control.ResourceValue.encode(message.values[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.generation != null && Object.hasOwnProperty.call(message, "generation"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.generation);
            return writer;
        };

        /**
         * Encodes the specified ResourceSnapshot message, length delimited. Does not implicitly {@link esp_control.ResourceSnapshot.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.ResourceSnapshot
         * @static
         * @param {esp_control.IResourceSnapshot} message ResourceSnapshot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResourceSnapshot.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ResourceSnapshot message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.ResourceSnapshot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.ResourceSnapshot} ResourceSnapshot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResourceSnapshot.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.ResourceSnapshot();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.values && message.values.length))
                            message.values = [];
                        message.values.push($root.esp_control.ResourceValue.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.generation = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ResourceSnapshot message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.ResourceSnapshot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.ResourceSnapshot} ResourceSnapshot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResourceSnapshot.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ResourceSnapshot message.
         * @function verify
         * @memberof esp_control.ResourceSnapshot
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ResourceSnapshot.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.values != null && message.hasOwnProperty("values")) {
                if (!Array.isArray(message.values))
                    return "values: array expected";
                for (let i = 0; i < message.values.length; ++i) {
                    let error = $root.esp_control.ResourceValue.verify(message.values[i]);
                    if (error)
                        return "values." + error;
                }
            }
            if (message.generation != null && message.hasOwnProperty("generation"))
                if (!$util.isInteger(message.generation))
                    return "generation: integer expected";
            return null;
        };

        /**
         * Creates a ResourceSnapshot message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.ResourceSnapshot
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.ResourceSnapshot} ResourceSnapshot
         */
        ResourceSnapshot.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.ResourceSnapshot)
                return object;
            let message = new $root.esp_control.ResourceSnapshot();
            if (object.values) {
                if (!Array.isArray(object.values))
                    throw TypeError(".esp_control.ResourceSnapshot.values: array expected");
                message.values = [];
                for (let i = 0; i < object.values.length; ++i) {
                    if (typeof object.values[i] !== "object")
                        throw TypeError(".esp_control.ResourceSnapshot.values: object expected");
                    message.values[i] = $root.esp_control.ResourceValue.fromObject(object.values[i]);
                }
            }
            if (object.generation != null)
                message.generation = object.generation >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a ResourceSnapshot message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.ResourceSnapshot
         * @static
         * @param {esp_control.ResourceSnapshot} message ResourceSnapshot
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ResourceSnapshot.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.values = [];
            if (options.defaults)
                object.generation = 0;
            if (message.values && message.values.length) {
                object.values = [];
                for (let j = 0; j < message.values.length; ++j)
                    object.values[j] = $root.esp_control.ResourceValue.toObject(message.values[j], options);
            }
            if (message.generation != null && message.hasOwnProperty("generation"))
                object.generation = message.generation;
            return object;
        };

        /**
         * Converts this ResourceSnapshot to JSON.
         * @function toJSON
         * @memberof esp_control.ResourceSnapshot
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ResourceSnapshot.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ResourceSnapshot
         * @function getTypeUrl
         * @memberof esp_control.ResourceSnapshot
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ResourceSnapshot.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.ResourceSnapshot";
        };

        return ResourceSnapshot;
    })();

    esp_control.ResourceDelta = (function() {

        /**
         * Properties of a ResourceDelta.
         * @memberof esp_control
         * @interface IResourceDelta
         * @property {number|null} [resourceId] ResourceDelta resourceId
         * @property {esp_control.ICommonValue|null} [value] ResourceDelta value
         * @property {number|null} [generation] ResourceDelta generation
         */

        /**
         * Constructs a new ResourceDelta.
         * @memberof esp_control
         * @classdesc Represents a ResourceDelta.
         * @implements IResourceDelta
         * @constructor
         * @param {esp_control.IResourceDelta=} [properties] Properties to set
         */
        function ResourceDelta(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ResourceDelta resourceId.
         * @member {number} resourceId
         * @memberof esp_control.ResourceDelta
         * @instance
         */
        ResourceDelta.prototype.resourceId = 0;

        /**
         * ResourceDelta value.
         * @member {esp_control.ICommonValue|null|undefined} value
         * @memberof esp_control.ResourceDelta
         * @instance
         */
        ResourceDelta.prototype.value = null;

        /**
         * ResourceDelta generation.
         * @member {number} generation
         * @memberof esp_control.ResourceDelta
         * @instance
         */
        ResourceDelta.prototype.generation = 0;

        /**
         * Creates a new ResourceDelta instance using the specified properties.
         * @function create
         * @memberof esp_control.ResourceDelta
         * @static
         * @param {esp_control.IResourceDelta=} [properties] Properties to set
         * @returns {esp_control.ResourceDelta} ResourceDelta instance
         */
        ResourceDelta.create = function create(properties) {
            return new ResourceDelta(properties);
        };

        /**
         * Encodes the specified ResourceDelta message. Does not implicitly {@link esp_control.ResourceDelta.verify|verify} messages.
         * @function encode
         * @memberof esp_control.ResourceDelta
         * @static
         * @param {esp_control.IResourceDelta} message ResourceDelta message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResourceDelta.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.resourceId != null && Object.hasOwnProperty.call(message, "resourceId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.resourceId);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                $root.esp_control.CommonValue.encode(message.value, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.generation != null && Object.hasOwnProperty.call(message, "generation"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.generation);
            return writer;
        };

        /**
         * Encodes the specified ResourceDelta message, length delimited. Does not implicitly {@link esp_control.ResourceDelta.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.ResourceDelta
         * @static
         * @param {esp_control.IResourceDelta} message ResourceDelta message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResourceDelta.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ResourceDelta message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.ResourceDelta
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.ResourceDelta} ResourceDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResourceDelta.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.ResourceDelta();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.resourceId = reader.uint32();
                        break;
                    }
                case 2: {
                        message.value = $root.esp_control.CommonValue.decode(reader, reader.uint32());
                        break;
                    }
                case 7: {
                        message.generation = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ResourceDelta message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.ResourceDelta
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.ResourceDelta} ResourceDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResourceDelta.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ResourceDelta message.
         * @function verify
         * @memberof esp_control.ResourceDelta
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ResourceDelta.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.resourceId != null && message.hasOwnProperty("resourceId"))
                if (!$util.isInteger(message.resourceId))
                    return "resourceId: integer expected";
            if (message.value != null && message.hasOwnProperty("value")) {
                let error = $root.esp_control.CommonValue.verify(message.value);
                if (error)
                    return "value." + error;
            }
            if (message.generation != null && message.hasOwnProperty("generation"))
                if (!$util.isInteger(message.generation))
                    return "generation: integer expected";
            return null;
        };

        /**
         * Creates a ResourceDelta message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.ResourceDelta
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.ResourceDelta} ResourceDelta
         */
        ResourceDelta.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.ResourceDelta)
                return object;
            let message = new $root.esp_control.ResourceDelta();
            if (object.resourceId != null)
                message.resourceId = object.resourceId >>> 0;
            if (object.value != null) {
                if (typeof object.value !== "object")
                    throw TypeError(".esp_control.ResourceDelta.value: object expected");
                message.value = $root.esp_control.CommonValue.fromObject(object.value);
            }
            if (object.generation != null)
                message.generation = object.generation >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a ResourceDelta message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.ResourceDelta
         * @static
         * @param {esp_control.ResourceDelta} message ResourceDelta
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ResourceDelta.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.resourceId = 0;
                object.value = null;
                object.generation = 0;
            }
            if (message.resourceId != null && message.hasOwnProperty("resourceId"))
                object.resourceId = message.resourceId;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = $root.esp_control.CommonValue.toObject(message.value, options);
            if (message.generation != null && message.hasOwnProperty("generation"))
                object.generation = message.generation;
            return object;
        };

        /**
         * Converts this ResourceDelta to JSON.
         * @function toJSON
         * @memberof esp_control.ResourceDelta
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ResourceDelta.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ResourceDelta
         * @function getTypeUrl
         * @memberof esp_control.ResourceDelta
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ResourceDelta.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.ResourceDelta";
        };

        return ResourceDelta;
    })();

    esp_control.InvokeAction = (function() {

        /**
         * Properties of an InvokeAction.
         * @memberof esp_control
         * @interface IInvokeAction
         * @property {number|null} [actionId] InvokeAction actionId
         * @property {esp_control.ICommonValue|null} [payload] InvokeAction payload
         * @property {number|null} [correlationId] InvokeAction correlationId
         */

        /**
         * Constructs a new InvokeAction.
         * @memberof esp_control
         * @classdesc Represents an InvokeAction.
         * @implements IInvokeAction
         * @constructor
         * @param {esp_control.IInvokeAction=} [properties] Properties to set
         */
        function InvokeAction(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * InvokeAction actionId.
         * @member {number} actionId
         * @memberof esp_control.InvokeAction
         * @instance
         */
        InvokeAction.prototype.actionId = 0;

        /**
         * InvokeAction payload.
         * @member {esp_control.ICommonValue|null|undefined} payload
         * @memberof esp_control.InvokeAction
         * @instance
         */
        InvokeAction.prototype.payload = null;

        /**
         * InvokeAction correlationId.
         * @member {number} correlationId
         * @memberof esp_control.InvokeAction
         * @instance
         */
        InvokeAction.prototype.correlationId = 0;

        /**
         * Creates a new InvokeAction instance using the specified properties.
         * @function create
         * @memberof esp_control.InvokeAction
         * @static
         * @param {esp_control.IInvokeAction=} [properties] Properties to set
         * @returns {esp_control.InvokeAction} InvokeAction instance
         */
        InvokeAction.create = function create(properties) {
            return new InvokeAction(properties);
        };

        /**
         * Encodes the specified InvokeAction message. Does not implicitly {@link esp_control.InvokeAction.verify|verify} messages.
         * @function encode
         * @memberof esp_control.InvokeAction
         * @static
         * @param {esp_control.IInvokeAction} message InvokeAction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InvokeAction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.actionId != null && Object.hasOwnProperty.call(message, "actionId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.actionId);
            if (message.payload != null && Object.hasOwnProperty.call(message, "payload"))
                $root.esp_control.CommonValue.encode(message.payload, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.correlationId != null && Object.hasOwnProperty.call(message, "correlationId"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.correlationId);
            return writer;
        };

        /**
         * Encodes the specified InvokeAction message, length delimited. Does not implicitly {@link esp_control.InvokeAction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.InvokeAction
         * @static
         * @param {esp_control.IInvokeAction} message InvokeAction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InvokeAction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an InvokeAction message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.InvokeAction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.InvokeAction} InvokeAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InvokeAction.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.InvokeAction();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.actionId = reader.uint32();
                        break;
                    }
                case 2: {
                        message.payload = $root.esp_control.CommonValue.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.correlationId = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an InvokeAction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.InvokeAction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.InvokeAction} InvokeAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InvokeAction.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an InvokeAction message.
         * @function verify
         * @memberof esp_control.InvokeAction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        InvokeAction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.actionId != null && message.hasOwnProperty("actionId"))
                if (!$util.isInteger(message.actionId))
                    return "actionId: integer expected";
            if (message.payload != null && message.hasOwnProperty("payload")) {
                let error = $root.esp_control.CommonValue.verify(message.payload);
                if (error)
                    return "payload." + error;
            }
            if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                if (!$util.isInteger(message.correlationId))
                    return "correlationId: integer expected";
            return null;
        };

        /**
         * Creates an InvokeAction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.InvokeAction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.InvokeAction} InvokeAction
         */
        InvokeAction.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.InvokeAction)
                return object;
            let message = new $root.esp_control.InvokeAction();
            if (object.actionId != null)
                message.actionId = object.actionId >>> 0;
            if (object.payload != null) {
                if (typeof object.payload !== "object")
                    throw TypeError(".esp_control.InvokeAction.payload: object expected");
                message.payload = $root.esp_control.CommonValue.fromObject(object.payload);
            }
            if (object.correlationId != null)
                message.correlationId = object.correlationId >>> 0;
            return message;
        };

        /**
         * Creates a plain object from an InvokeAction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.InvokeAction
         * @static
         * @param {esp_control.InvokeAction} message InvokeAction
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        InvokeAction.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.actionId = 0;
                object.payload = null;
                object.correlationId = 0;
            }
            if (message.actionId != null && message.hasOwnProperty("actionId"))
                object.actionId = message.actionId;
            if (message.payload != null && message.hasOwnProperty("payload"))
                object.payload = $root.esp_control.CommonValue.toObject(message.payload, options);
            if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                object.correlationId = message.correlationId;
            return object;
        };

        /**
         * Converts this InvokeAction to JSON.
         * @function toJSON
         * @memberof esp_control.InvokeAction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        InvokeAction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for InvokeAction
         * @function getTypeUrl
         * @memberof esp_control.InvokeAction
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        InvokeAction.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.InvokeAction";
        };

        return InvokeAction;
    })();

    esp_control.InvokeResult = (function() {

        /**
         * Properties of an InvokeResult.
         * @memberof esp_control
         * @interface IInvokeResult
         * @property {number|null} [correlationId] InvokeResult correlationId
         * @property {esp_control.Status|null} [status] InvokeResult status
         * @property {esp_control.ICommonValue|null} [payload] InvokeResult payload
         * @property {string|null} [message] InvokeResult message
         */

        /**
         * Constructs a new InvokeResult.
         * @memberof esp_control
         * @classdesc Represents an InvokeResult.
         * @implements IInvokeResult
         * @constructor
         * @param {esp_control.IInvokeResult=} [properties] Properties to set
         */
        function InvokeResult(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * InvokeResult correlationId.
         * @member {number} correlationId
         * @memberof esp_control.InvokeResult
         * @instance
         */
        InvokeResult.prototype.correlationId = 0;

        /**
         * InvokeResult status.
         * @member {esp_control.Status} status
         * @memberof esp_control.InvokeResult
         * @instance
         */
        InvokeResult.prototype.status = 0;

        /**
         * InvokeResult payload.
         * @member {esp_control.ICommonValue|null|undefined} payload
         * @memberof esp_control.InvokeResult
         * @instance
         */
        InvokeResult.prototype.payload = null;

        /**
         * InvokeResult message.
         * @member {string} message
         * @memberof esp_control.InvokeResult
         * @instance
         */
        InvokeResult.prototype.message = "";

        /**
         * Creates a new InvokeResult instance using the specified properties.
         * @function create
         * @memberof esp_control.InvokeResult
         * @static
         * @param {esp_control.IInvokeResult=} [properties] Properties to set
         * @returns {esp_control.InvokeResult} InvokeResult instance
         */
        InvokeResult.create = function create(properties) {
            return new InvokeResult(properties);
        };

        /**
         * Encodes the specified InvokeResult message. Does not implicitly {@link esp_control.InvokeResult.verify|verify} messages.
         * @function encode
         * @memberof esp_control.InvokeResult
         * @static
         * @param {esp_control.IInvokeResult} message InvokeResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InvokeResult.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.correlationId != null && Object.hasOwnProperty.call(message, "correlationId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.correlationId);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.status);
            if (message.payload != null && Object.hasOwnProperty.call(message, "payload"))
                $root.esp_control.CommonValue.encode(message.payload, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.message);
            return writer;
        };

        /**
         * Encodes the specified InvokeResult message, length delimited. Does not implicitly {@link esp_control.InvokeResult.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.InvokeResult
         * @static
         * @param {esp_control.IInvokeResult} message InvokeResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InvokeResult.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an InvokeResult message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.InvokeResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.InvokeResult} InvokeResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InvokeResult.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.InvokeResult();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.correlationId = reader.uint32();
                        break;
                    }
                case 2: {
                        message.status = reader.int32();
                        break;
                    }
                case 3: {
                        message.payload = $root.esp_control.CommonValue.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.message = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an InvokeResult message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.InvokeResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.InvokeResult} InvokeResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InvokeResult.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an InvokeResult message.
         * @function verify
         * @memberof esp_control.InvokeResult
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        InvokeResult.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                if (!$util.isInteger(message.correlationId))
                    return "correlationId: integer expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                }
            if (message.payload != null && message.hasOwnProperty("payload")) {
                let error = $root.esp_control.CommonValue.verify(message.payload);
                if (error)
                    return "payload." + error;
            }
            if (message.message != null && message.hasOwnProperty("message"))
                if (!$util.isString(message.message))
                    return "message: string expected";
            return null;
        };

        /**
         * Creates an InvokeResult message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.InvokeResult
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.InvokeResult} InvokeResult
         */
        InvokeResult.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.InvokeResult)
                return object;
            let message = new $root.esp_control.InvokeResult();
            if (object.correlationId != null)
                message.correlationId = object.correlationId >>> 0;
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "STATUS_OK":
            case 1:
                message.status = 1;
                break;
            case "STATUS_BAD_PAYLOAD":
            case 2:
                message.status = 2;
                break;
            case "STATUS_UNKNOWN_ACTION":
            case 3:
                message.status = 3;
                break;
            case "STATUS_UNAUTHORIZED":
            case 4:
                message.status = 4;
                break;
            case "STATUS_INTERNAL":
            case 5:
                message.status = 5;
                break;
            }
            if (object.payload != null) {
                if (typeof object.payload !== "object")
                    throw TypeError(".esp_control.InvokeResult.payload: object expected");
                message.payload = $root.esp_control.CommonValue.fromObject(object.payload);
            }
            if (object.message != null)
                message.message = String(object.message);
            return message;
        };

        /**
         * Creates a plain object from an InvokeResult message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.InvokeResult
         * @static
         * @param {esp_control.InvokeResult} message InvokeResult
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        InvokeResult.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.correlationId = 0;
                object.status = options.enums === String ? "STATUS_UNSPECIFIED" : 0;
                object.payload = null;
                object.message = "";
            }
            if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                object.correlationId = message.correlationId;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.esp_control.Status[message.status] === undefined ? message.status : $root.esp_control.Status[message.status] : message.status;
            if (message.payload != null && message.hasOwnProperty("payload"))
                object.payload = $root.esp_control.CommonValue.toObject(message.payload, options);
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = message.message;
            return object;
        };

        /**
         * Converts this InvokeResult to JSON.
         * @function toJSON
         * @memberof esp_control.InvokeResult
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        InvokeResult.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for InvokeResult
         * @function getTypeUrl
         * @memberof esp_control.InvokeResult
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        InvokeResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.InvokeResult";
        };

        return InvokeResult;
    })();

    esp_control.Subscribe = (function() {

        /**
         * Properties of a Subscribe.
         * @memberof esp_control
         * @interface ISubscribe
         * @property {Array.<number>|null} [resourceIds] Subscribe resourceIds
         */

        /**
         * Constructs a new Subscribe.
         * @memberof esp_control
         * @classdesc Represents a Subscribe.
         * @implements ISubscribe
         * @constructor
         * @param {esp_control.ISubscribe=} [properties] Properties to set
         */
        function Subscribe(properties) {
            this.resourceIds = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Subscribe resourceIds.
         * @member {Array.<number>} resourceIds
         * @memberof esp_control.Subscribe
         * @instance
         */
        Subscribe.prototype.resourceIds = $util.emptyArray;

        /**
         * Creates a new Subscribe instance using the specified properties.
         * @function create
         * @memberof esp_control.Subscribe
         * @static
         * @param {esp_control.ISubscribe=} [properties] Properties to set
         * @returns {esp_control.Subscribe} Subscribe instance
         */
        Subscribe.create = function create(properties) {
            return new Subscribe(properties);
        };

        /**
         * Encodes the specified Subscribe message. Does not implicitly {@link esp_control.Subscribe.verify|verify} messages.
         * @function encode
         * @memberof esp_control.Subscribe
         * @static
         * @param {esp_control.ISubscribe} message Subscribe message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Subscribe.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.resourceIds != null && message.resourceIds.length) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork();
                for (let i = 0; i < message.resourceIds.length; ++i)
                    writer.uint32(message.resourceIds[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified Subscribe message, length delimited. Does not implicitly {@link esp_control.Subscribe.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.Subscribe
         * @static
         * @param {esp_control.ISubscribe} message Subscribe message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Subscribe.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Subscribe message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.Subscribe
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.Subscribe} Subscribe
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Subscribe.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.Subscribe();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.resourceIds && message.resourceIds.length))
                            message.resourceIds = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.resourceIds.push(reader.uint32());
                        } else
                            message.resourceIds.push(reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Subscribe message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.Subscribe
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.Subscribe} Subscribe
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Subscribe.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Subscribe message.
         * @function verify
         * @memberof esp_control.Subscribe
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Subscribe.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.resourceIds != null && message.hasOwnProperty("resourceIds")) {
                if (!Array.isArray(message.resourceIds))
                    return "resourceIds: array expected";
                for (let i = 0; i < message.resourceIds.length; ++i)
                    if (!$util.isInteger(message.resourceIds[i]))
                        return "resourceIds: integer[] expected";
            }
            return null;
        };

        /**
         * Creates a Subscribe message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.Subscribe
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.Subscribe} Subscribe
         */
        Subscribe.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.Subscribe)
                return object;
            let message = new $root.esp_control.Subscribe();
            if (object.resourceIds) {
                if (!Array.isArray(object.resourceIds))
                    throw TypeError(".esp_control.Subscribe.resourceIds: array expected");
                message.resourceIds = [];
                for (let i = 0; i < object.resourceIds.length; ++i)
                    message.resourceIds[i] = object.resourceIds[i] >>> 0;
            }
            return message;
        };

        /**
         * Creates a plain object from a Subscribe message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.Subscribe
         * @static
         * @param {esp_control.Subscribe} message Subscribe
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Subscribe.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.resourceIds = [];
            if (message.resourceIds && message.resourceIds.length) {
                object.resourceIds = [];
                for (let j = 0; j < message.resourceIds.length; ++j)
                    object.resourceIds[j] = message.resourceIds[j];
            }
            return object;
        };

        /**
         * Converts this Subscribe to JSON.
         * @function toJSON
         * @memberof esp_control.Subscribe
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Subscribe.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Subscribe
         * @function getTypeUrl
         * @memberof esp_control.Subscribe
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Subscribe.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.Subscribe";
        };

        return Subscribe;
    })();

    esp_control.Unsubscribe = (function() {

        /**
         * Properties of an Unsubscribe.
         * @memberof esp_control
         * @interface IUnsubscribe
         * @property {Array.<number>|null} [resourceIds] Unsubscribe resourceIds
         */

        /**
         * Constructs a new Unsubscribe.
         * @memberof esp_control
         * @classdesc Represents an Unsubscribe.
         * @implements IUnsubscribe
         * @constructor
         * @param {esp_control.IUnsubscribe=} [properties] Properties to set
         */
        function Unsubscribe(properties) {
            this.resourceIds = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Unsubscribe resourceIds.
         * @member {Array.<number>} resourceIds
         * @memberof esp_control.Unsubscribe
         * @instance
         */
        Unsubscribe.prototype.resourceIds = $util.emptyArray;

        /**
         * Creates a new Unsubscribe instance using the specified properties.
         * @function create
         * @memberof esp_control.Unsubscribe
         * @static
         * @param {esp_control.IUnsubscribe=} [properties] Properties to set
         * @returns {esp_control.Unsubscribe} Unsubscribe instance
         */
        Unsubscribe.create = function create(properties) {
            return new Unsubscribe(properties);
        };

        /**
         * Encodes the specified Unsubscribe message. Does not implicitly {@link esp_control.Unsubscribe.verify|verify} messages.
         * @function encode
         * @memberof esp_control.Unsubscribe
         * @static
         * @param {esp_control.IUnsubscribe} message Unsubscribe message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Unsubscribe.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.resourceIds != null && message.resourceIds.length) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork();
                for (let i = 0; i < message.resourceIds.length; ++i)
                    writer.uint32(message.resourceIds[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified Unsubscribe message, length delimited. Does not implicitly {@link esp_control.Unsubscribe.verify|verify} messages.
         * @function encodeDelimited
         * @memberof esp_control.Unsubscribe
         * @static
         * @param {esp_control.IUnsubscribe} message Unsubscribe message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Unsubscribe.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Unsubscribe message from the specified reader or buffer.
         * @function decode
         * @memberof esp_control.Unsubscribe
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {esp_control.Unsubscribe} Unsubscribe
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Unsubscribe.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.Unsubscribe();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.resourceIds && message.resourceIds.length))
                            message.resourceIds = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.resourceIds.push(reader.uint32());
                        } else
                            message.resourceIds.push(reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Unsubscribe message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof esp_control.Unsubscribe
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {esp_control.Unsubscribe} Unsubscribe
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Unsubscribe.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Unsubscribe message.
         * @function verify
         * @memberof esp_control.Unsubscribe
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Unsubscribe.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.resourceIds != null && message.hasOwnProperty("resourceIds")) {
                if (!Array.isArray(message.resourceIds))
                    return "resourceIds: array expected";
                for (let i = 0; i < message.resourceIds.length; ++i)
                    if (!$util.isInteger(message.resourceIds[i]))
                        return "resourceIds: integer[] expected";
            }
            return null;
        };

        /**
         * Creates an Unsubscribe message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof esp_control.Unsubscribe
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {esp_control.Unsubscribe} Unsubscribe
         */
        Unsubscribe.fromObject = function fromObject(object) {
            if (object instanceof $root.esp_control.Unsubscribe)
                return object;
            let message = new $root.esp_control.Unsubscribe();
            if (object.resourceIds) {
                if (!Array.isArray(object.resourceIds))
                    throw TypeError(".esp_control.Unsubscribe.resourceIds: array expected");
                message.resourceIds = [];
                for (let i = 0; i < object.resourceIds.length; ++i)
                    message.resourceIds[i] = object.resourceIds[i] >>> 0;
            }
            return message;
        };

        /**
         * Creates a plain object from an Unsubscribe message. Also converts values to other types if specified.
         * @function toObject
         * @memberof esp_control.Unsubscribe
         * @static
         * @param {esp_control.Unsubscribe} message Unsubscribe
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Unsubscribe.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.resourceIds = [];
            if (message.resourceIds && message.resourceIds.length) {
                object.resourceIds = [];
                for (let j = 0; j < message.resourceIds.length; ++j)
                    object.resourceIds[j] = message.resourceIds[j];
            }
            return object;
        };

        /**
         * Converts this Unsubscribe to JSON.
         * @function toJSON
         * @memberof esp_control.Unsubscribe
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Unsubscribe.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Unsubscribe
         * @function getTypeUrl
         * @memberof esp_control.Unsubscribe
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Unsubscribe.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/esp_control.Unsubscribe";
        };

        return Unsubscribe;
    })();

    return esp_control;
})();

export { $root as default };
