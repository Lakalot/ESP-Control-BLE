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

    esp_control.v5 = (function() {

        /**
         * Namespace v5.
         * @memberof esp_control
         * @namespace
         */
        const v5 = {};

        /**
         * ValueType enum.
         * @name esp_control.v5.ValueType
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
        v5.ValueType = (function() {
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
         * @name esp_control.v5.ReadMode
         * @enum {number}
         * @property {number} READ_MODE_UNSPECIFIED=0 READ_MODE_UNSPECIFIED value
         * @property {number} READ_MODE_SNAPSHOT=1 READ_MODE_SNAPSHOT value
         * @property {number} READ_MODE_SUBSCRIBE=2 READ_MODE_SUBSCRIBE value
         * @property {number} READ_MODE_POLL=3 READ_MODE_POLL value
         */
        v5.ReadMode = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "READ_MODE_UNSPECIFIED"] = 0;
            values[valuesById[1] = "READ_MODE_SNAPSHOT"] = 1;
            values[valuesById[2] = "READ_MODE_SUBSCRIBE"] = 2;
            values[valuesById[3] = "READ_MODE_POLL"] = 3;
            return values;
        })();

        /**
         * DangerLevel enum.
         * @name esp_control.v5.DangerLevel
         * @enum {number}
         * @property {number} DANGER_LEVEL_UNSPECIFIED=0 DANGER_LEVEL_UNSPECIFIED value
         * @property {number} DANGER_LEVEL_NORMAL=1 DANGER_LEVEL_NORMAL value
         * @property {number} DANGER_LEVEL_ELEVATED=2 DANGER_LEVEL_ELEVATED value
         * @property {number} DANGER_LEVEL_DANGEROUS=3 DANGER_LEVEL_DANGEROUS value
         */
        v5.DangerLevel = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "DANGER_LEVEL_UNSPECIFIED"] = 0;
            values[valuesById[1] = "DANGER_LEVEL_NORMAL"] = 1;
            values[valuesById[2] = "DANGER_LEVEL_ELEVATED"] = 2;
            values[valuesById[3] = "DANGER_LEVEL_DANGEROUS"] = 3;
            return values;
        })();

        /**
         * NodeKind enum.
         * @name esp_control.v5.NodeKind
         * @enum {number}
         * @property {number} NODE_KIND_UNSPECIFIED=0 NODE_KIND_UNSPECIFIED value
         * @property {number} NODE_KIND_STACK=1 NODE_KIND_STACK value
         * @property {number} NODE_KIND_ROW=2 NODE_KIND_ROW value
         * @property {number} NODE_KIND_GRID=3 NODE_KIND_GRID value
         * @property {number} NODE_KIND_SECTION=4 NODE_KIND_SECTION value
         * @property {number} NODE_KIND_WIDGET=5 NODE_KIND_WIDGET value
         */
        v5.NodeKind = (function() {
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
         * @name esp_control.v5.WidgetKind
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
        v5.WidgetKind = (function() {
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

        v5.StringEntry = (function() {

            /**
             * Properties of a StringEntry.
             * @memberof esp_control.v5
             * @interface IStringEntry
             * @property {string|null} [value] StringEntry value
             */

            /**
             * Constructs a new StringEntry.
             * @memberof esp_control.v5
             * @classdesc Represents a StringEntry.
             * @implements IStringEntry
             * @constructor
             * @param {esp_control.v5.IStringEntry=} [properties] Properties to set
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
             * @memberof esp_control.v5.StringEntry
             * @instance
             */
            StringEntry.prototype.value = "";

            /**
             * Creates a new StringEntry instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.StringEntry
             * @static
             * @param {esp_control.v5.IStringEntry=} [properties] Properties to set
             * @returns {esp_control.v5.StringEntry} StringEntry instance
             */
            StringEntry.create = function create(properties) {
                return new StringEntry(properties);
            };

            /**
             * Encodes the specified StringEntry message. Does not implicitly {@link esp_control.v5.StringEntry.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.StringEntry
             * @static
             * @param {esp_control.v5.IStringEntry} message StringEntry message or plain object to encode
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
             * Encodes the specified StringEntry message, length delimited. Does not implicitly {@link esp_control.v5.StringEntry.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.StringEntry
             * @static
             * @param {esp_control.v5.IStringEntry} message StringEntry message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StringEntry.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a StringEntry message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.StringEntry
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.StringEntry} StringEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StringEntry.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.StringEntry();
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
             * @memberof esp_control.v5.StringEntry
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.StringEntry} StringEntry
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
             * @memberof esp_control.v5.StringEntry
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
             * @memberof esp_control.v5.StringEntry
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.StringEntry} StringEntry
             */
            StringEntry.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.StringEntry)
                    return object;
                let message = new $root.esp_control.v5.StringEntry();
                if (object.value != null)
                    message.value = String(object.value);
                return message;
            };

            /**
             * Creates a plain object from a StringEntry message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.StringEntry
             * @static
             * @param {esp_control.v5.StringEntry} message StringEntry
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
             * @memberof esp_control.v5.StringEntry
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            StringEntry.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for StringEntry
             * @function getTypeUrl
             * @memberof esp_control.v5.StringEntry
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            StringEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.StringEntry";
            };

            return StringEntry;
        })();

        v5.Rule = (function() {

            /**
             * Properties of a Rule.
             * @memberof esp_control.v5
             * @interface IRule
             * @property {string|null} [jsonlogic] Rule jsonlogic
             */

            /**
             * Constructs a new Rule.
             * @memberof esp_control.v5
             * @classdesc Represents a Rule.
             * @implements IRule
             * @constructor
             * @param {esp_control.v5.IRule=} [properties] Properties to set
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
             * @memberof esp_control.v5.Rule
             * @instance
             */
            Rule.prototype.jsonlogic = "";

            /**
             * Creates a new Rule instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.Rule
             * @static
             * @param {esp_control.v5.IRule=} [properties] Properties to set
             * @returns {esp_control.v5.Rule} Rule instance
             */
            Rule.create = function create(properties) {
                return new Rule(properties);
            };

            /**
             * Encodes the specified Rule message. Does not implicitly {@link esp_control.v5.Rule.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.Rule
             * @static
             * @param {esp_control.v5.IRule} message Rule message or plain object to encode
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
             * Encodes the specified Rule message, length delimited. Does not implicitly {@link esp_control.v5.Rule.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.Rule
             * @static
             * @param {esp_control.v5.IRule} message Rule message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Rule.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Rule message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.Rule
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.Rule} Rule
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Rule.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.Rule();
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
             * @memberof esp_control.v5.Rule
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.Rule} Rule
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
             * @memberof esp_control.v5.Rule
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
             * @memberof esp_control.v5.Rule
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.Rule} Rule
             */
            Rule.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.Rule)
                    return object;
                let message = new $root.esp_control.v5.Rule();
                if (object.jsonlogic != null)
                    message.jsonlogic = String(object.jsonlogic);
                return message;
            };

            /**
             * Creates a plain object from a Rule message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.Rule
             * @static
             * @param {esp_control.v5.Rule} message Rule
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
             * @memberof esp_control.v5.Rule
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Rule.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Rule
             * @function getTypeUrl
             * @memberof esp_control.v5.Rule
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Rule.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.Rule";
            };

            return Rule;
        })();

        v5.CapabilitiesDef = (function() {

            /**
             * Properties of a CapabilitiesDef.
             * @memberof esp_control.v5
             * @interface ICapabilitiesDef
             * @property {Array.<number>|null} [featureIdxs] CapabilitiesDef featureIdxs
             */

            /**
             * Constructs a new CapabilitiesDef.
             * @memberof esp_control.v5
             * @classdesc Represents a CapabilitiesDef.
             * @implements ICapabilitiesDef
             * @constructor
             * @param {esp_control.v5.ICapabilitiesDef=} [properties] Properties to set
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
             * @memberof esp_control.v5.CapabilitiesDef
             * @instance
             */
            CapabilitiesDef.prototype.featureIdxs = $util.emptyArray;

            /**
             * Creates a new CapabilitiesDef instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.CapabilitiesDef
             * @static
             * @param {esp_control.v5.ICapabilitiesDef=} [properties] Properties to set
             * @returns {esp_control.v5.CapabilitiesDef} CapabilitiesDef instance
             */
            CapabilitiesDef.create = function create(properties) {
                return new CapabilitiesDef(properties);
            };

            /**
             * Encodes the specified CapabilitiesDef message. Does not implicitly {@link esp_control.v5.CapabilitiesDef.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.CapabilitiesDef
             * @static
             * @param {esp_control.v5.ICapabilitiesDef} message CapabilitiesDef message or plain object to encode
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
             * Encodes the specified CapabilitiesDef message, length delimited. Does not implicitly {@link esp_control.v5.CapabilitiesDef.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.CapabilitiesDef
             * @static
             * @param {esp_control.v5.ICapabilitiesDef} message CapabilitiesDef message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CapabilitiesDef.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CapabilitiesDef message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.CapabilitiesDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.CapabilitiesDef} CapabilitiesDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CapabilitiesDef.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.CapabilitiesDef();
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
             * @memberof esp_control.v5.CapabilitiesDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.CapabilitiesDef} CapabilitiesDef
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
             * @memberof esp_control.v5.CapabilitiesDef
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
             * @memberof esp_control.v5.CapabilitiesDef
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.CapabilitiesDef} CapabilitiesDef
             */
            CapabilitiesDef.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.CapabilitiesDef)
                    return object;
                let message = new $root.esp_control.v5.CapabilitiesDef();
                if (object.featureIdxs) {
                    if (!Array.isArray(object.featureIdxs))
                        throw TypeError(".esp_control.v5.CapabilitiesDef.featureIdxs: array expected");
                    message.featureIdxs = [];
                    for (let i = 0; i < object.featureIdxs.length; ++i)
                        message.featureIdxs[i] = object.featureIdxs[i] >>> 0;
                }
                return message;
            };

            /**
             * Creates a plain object from a CapabilitiesDef message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.CapabilitiesDef
             * @static
             * @param {esp_control.v5.CapabilitiesDef} message CapabilitiesDef
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
             * @memberof esp_control.v5.CapabilitiesDef
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CapabilitiesDef.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CapabilitiesDef
             * @function getTypeUrl
             * @memberof esp_control.v5.CapabilitiesDef
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CapabilitiesDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.CapabilitiesDef";
            };

            return CapabilitiesDef;
        })();

        v5.ResourceDef = (function() {

            /**
             * Properties of a ResourceDef.
             * @memberof esp_control.v5
             * @interface IResourceDef
             * @property {number|null} [id] ResourceDef id
             * @property {number|null} [slugIdx] ResourceDef slugIdx
             * @property {number|null} [labelIdx] ResourceDef labelIdx
             * @property {number|null} [unitIdx] ResourceDef unitIdx
             * @property {esp_control.v5.ValueType|null} [valueType] ResourceDef valueType
             * @property {esp_control.v5.ReadMode|null} [readMode] ResourceDef readMode
             * @property {number|null} [staleAfterMs] ResourceDef staleAfterMs
             * @property {number|null} [pollMs] ResourceDef pollMs
             * @property {Array.<number>|null} [enumValueIdxs] ResourceDef enumValueIdxs
             */

            /**
             * Constructs a new ResourceDef.
             * @memberof esp_control.v5
             * @classdesc Represents a ResourceDef.
             * @implements IResourceDef
             * @constructor
             * @param {esp_control.v5.IResourceDef=} [properties] Properties to set
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
             * @memberof esp_control.v5.ResourceDef
             * @instance
             */
            ResourceDef.prototype.id = 0;

            /**
             * ResourceDef slugIdx.
             * @member {number} slugIdx
             * @memberof esp_control.v5.ResourceDef
             * @instance
             */
            ResourceDef.prototype.slugIdx = 0;

            /**
             * ResourceDef labelIdx.
             * @member {number} labelIdx
             * @memberof esp_control.v5.ResourceDef
             * @instance
             */
            ResourceDef.prototype.labelIdx = 0;

            /**
             * ResourceDef unitIdx.
             * @member {number} unitIdx
             * @memberof esp_control.v5.ResourceDef
             * @instance
             */
            ResourceDef.prototype.unitIdx = 0;

            /**
             * ResourceDef valueType.
             * @member {esp_control.v5.ValueType} valueType
             * @memberof esp_control.v5.ResourceDef
             * @instance
             */
            ResourceDef.prototype.valueType = 0;

            /**
             * ResourceDef readMode.
             * @member {esp_control.v5.ReadMode} readMode
             * @memberof esp_control.v5.ResourceDef
             * @instance
             */
            ResourceDef.prototype.readMode = 0;

            /**
             * ResourceDef staleAfterMs.
             * @member {number} staleAfterMs
             * @memberof esp_control.v5.ResourceDef
             * @instance
             */
            ResourceDef.prototype.staleAfterMs = 0;

            /**
             * ResourceDef pollMs.
             * @member {number} pollMs
             * @memberof esp_control.v5.ResourceDef
             * @instance
             */
            ResourceDef.prototype.pollMs = 0;

            /**
             * ResourceDef enumValueIdxs.
             * @member {Array.<number>} enumValueIdxs
             * @memberof esp_control.v5.ResourceDef
             * @instance
             */
            ResourceDef.prototype.enumValueIdxs = $util.emptyArray;

            /**
             * Creates a new ResourceDef instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.ResourceDef
             * @static
             * @param {esp_control.v5.IResourceDef=} [properties] Properties to set
             * @returns {esp_control.v5.ResourceDef} ResourceDef instance
             */
            ResourceDef.create = function create(properties) {
                return new ResourceDef(properties);
            };

            /**
             * Encodes the specified ResourceDef message. Does not implicitly {@link esp_control.v5.ResourceDef.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.ResourceDef
             * @static
             * @param {esp_control.v5.IResourceDef} message ResourceDef message or plain object to encode
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
             * Encodes the specified ResourceDef message, length delimited. Does not implicitly {@link esp_control.v5.ResourceDef.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.ResourceDef
             * @static
             * @param {esp_control.v5.IResourceDef} message ResourceDef message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ResourceDef.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ResourceDef message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.ResourceDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.ResourceDef} ResourceDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ResourceDef.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.ResourceDef();
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
             * @memberof esp_control.v5.ResourceDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.ResourceDef} ResourceDef
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
             * @memberof esp_control.v5.ResourceDef
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
             * @memberof esp_control.v5.ResourceDef
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.ResourceDef} ResourceDef
             */
            ResourceDef.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.ResourceDef)
                    return object;
                let message = new $root.esp_control.v5.ResourceDef();
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
                        throw TypeError(".esp_control.v5.ResourceDef.enumValueIdxs: array expected");
                    message.enumValueIdxs = [];
                    for (let i = 0; i < object.enumValueIdxs.length; ++i)
                        message.enumValueIdxs[i] = object.enumValueIdxs[i] >>> 0;
                }
                return message;
            };

            /**
             * Creates a plain object from a ResourceDef message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.ResourceDef
             * @static
             * @param {esp_control.v5.ResourceDef} message ResourceDef
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
                    object.valueType = options.enums === String ? $root.esp_control.v5.ValueType[message.valueType] === undefined ? message.valueType : $root.esp_control.v5.ValueType[message.valueType] : message.valueType;
                if (message.readMode != null && message.hasOwnProperty("readMode"))
                    object.readMode = options.enums === String ? $root.esp_control.v5.ReadMode[message.readMode] === undefined ? message.readMode : $root.esp_control.v5.ReadMode[message.readMode] : message.readMode;
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
             * @memberof esp_control.v5.ResourceDef
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ResourceDef.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ResourceDef
             * @function getTypeUrl
             * @memberof esp_control.v5.ResourceDef
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ResourceDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.ResourceDef";
            };

            return ResourceDef;
        })();

        v5.ActionDef = (function() {

            /**
             * Properties of an ActionDef.
             * @memberof esp_control.v5
             * @interface IActionDef
             * @property {number|null} [id] ActionDef id
             * @property {number|null} [slugIdx] ActionDef slugIdx
             * @property {number|null} [labelIdx] ActionDef labelIdx
             * @property {esp_control.v5.DangerLevel|null} [dangerLevel] ActionDef dangerLevel
             * @property {number|null} [confirmIdx] ActionDef confirmIdx
             * @property {number|null} [cooldownMs] ActionDef cooldownMs
             * @property {number|null} [inputSchemaIdx] ActionDef inputSchemaIdx
             * @property {number|null} [resultSchemaIdx] ActionDef resultSchemaIdx
             */

            /**
             * Constructs a new ActionDef.
             * @memberof esp_control.v5
             * @classdesc Represents an ActionDef.
             * @implements IActionDef
             * @constructor
             * @param {esp_control.v5.IActionDef=} [properties] Properties to set
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
             * @memberof esp_control.v5.ActionDef
             * @instance
             */
            ActionDef.prototype.id = 0;

            /**
             * ActionDef slugIdx.
             * @member {number} slugIdx
             * @memberof esp_control.v5.ActionDef
             * @instance
             */
            ActionDef.prototype.slugIdx = 0;

            /**
             * ActionDef labelIdx.
             * @member {number} labelIdx
             * @memberof esp_control.v5.ActionDef
             * @instance
             */
            ActionDef.prototype.labelIdx = 0;

            /**
             * ActionDef dangerLevel.
             * @member {esp_control.v5.DangerLevel} dangerLevel
             * @memberof esp_control.v5.ActionDef
             * @instance
             */
            ActionDef.prototype.dangerLevel = 0;

            /**
             * ActionDef confirmIdx.
             * @member {number} confirmIdx
             * @memberof esp_control.v5.ActionDef
             * @instance
             */
            ActionDef.prototype.confirmIdx = 0;

            /**
             * ActionDef cooldownMs.
             * @member {number} cooldownMs
             * @memberof esp_control.v5.ActionDef
             * @instance
             */
            ActionDef.prototype.cooldownMs = 0;

            /**
             * ActionDef inputSchemaIdx.
             * @member {number} inputSchemaIdx
             * @memberof esp_control.v5.ActionDef
             * @instance
             */
            ActionDef.prototype.inputSchemaIdx = 0;

            /**
             * ActionDef resultSchemaIdx.
             * @member {number} resultSchemaIdx
             * @memberof esp_control.v5.ActionDef
             * @instance
             */
            ActionDef.prototype.resultSchemaIdx = 0;

            /**
             * Creates a new ActionDef instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.ActionDef
             * @static
             * @param {esp_control.v5.IActionDef=} [properties] Properties to set
             * @returns {esp_control.v5.ActionDef} ActionDef instance
             */
            ActionDef.create = function create(properties) {
                return new ActionDef(properties);
            };

            /**
             * Encodes the specified ActionDef message. Does not implicitly {@link esp_control.v5.ActionDef.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.ActionDef
             * @static
             * @param {esp_control.v5.IActionDef} message ActionDef message or plain object to encode
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
             * Encodes the specified ActionDef message, length delimited. Does not implicitly {@link esp_control.v5.ActionDef.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.ActionDef
             * @static
             * @param {esp_control.v5.IActionDef} message ActionDef message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ActionDef.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ActionDef message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.ActionDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.ActionDef} ActionDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ActionDef.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.ActionDef();
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
             * @memberof esp_control.v5.ActionDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.ActionDef} ActionDef
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
             * @memberof esp_control.v5.ActionDef
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
             * @memberof esp_control.v5.ActionDef
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.ActionDef} ActionDef
             */
            ActionDef.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.ActionDef)
                    return object;
                let message = new $root.esp_control.v5.ActionDef();
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
             * @memberof esp_control.v5.ActionDef
             * @static
             * @param {esp_control.v5.ActionDef} message ActionDef
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
                    object.dangerLevel = options.enums === String ? $root.esp_control.v5.DangerLevel[message.dangerLevel] === undefined ? message.dangerLevel : $root.esp_control.v5.DangerLevel[message.dangerLevel] : message.dangerLevel;
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
             * @memberof esp_control.v5.ActionDef
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ActionDef.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ActionDef
             * @function getTypeUrl
             * @memberof esp_control.v5.ActionDef
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ActionDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.ActionDef";
            };

            return ActionDef;
        })();

        v5.ScreenDef = (function() {

            /**
             * Properties of a ScreenDef.
             * @memberof esp_control.v5
             * @interface IScreenDef
             * @property {number|null} [id] ScreenDef id
             * @property {number|null} [slugIdx] ScreenDef slugIdx
             * @property {number|null} [titleIdx] ScreenDef titleIdx
             * @property {number|null} [routeKeyIdx] ScreenDef routeKeyIdx
             * @property {number|null} [rootNodeId] ScreenDef rootNodeId
             * @property {Array.<esp_control.v5.IRule>|null} [entryRules] ScreenDef entryRules
             */

            /**
             * Constructs a new ScreenDef.
             * @memberof esp_control.v5
             * @classdesc Represents a ScreenDef.
             * @implements IScreenDef
             * @constructor
             * @param {esp_control.v5.IScreenDef=} [properties] Properties to set
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
             * @memberof esp_control.v5.ScreenDef
             * @instance
             */
            ScreenDef.prototype.id = 0;

            /**
             * ScreenDef slugIdx.
             * @member {number} slugIdx
             * @memberof esp_control.v5.ScreenDef
             * @instance
             */
            ScreenDef.prototype.slugIdx = 0;

            /**
             * ScreenDef titleIdx.
             * @member {number} titleIdx
             * @memberof esp_control.v5.ScreenDef
             * @instance
             */
            ScreenDef.prototype.titleIdx = 0;

            /**
             * ScreenDef routeKeyIdx.
             * @member {number} routeKeyIdx
             * @memberof esp_control.v5.ScreenDef
             * @instance
             */
            ScreenDef.prototype.routeKeyIdx = 0;

            /**
             * ScreenDef rootNodeId.
             * @member {number} rootNodeId
             * @memberof esp_control.v5.ScreenDef
             * @instance
             */
            ScreenDef.prototype.rootNodeId = 0;

            /**
             * ScreenDef entryRules.
             * @member {Array.<esp_control.v5.IRule>} entryRules
             * @memberof esp_control.v5.ScreenDef
             * @instance
             */
            ScreenDef.prototype.entryRules = $util.emptyArray;

            /**
             * Creates a new ScreenDef instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.ScreenDef
             * @static
             * @param {esp_control.v5.IScreenDef=} [properties] Properties to set
             * @returns {esp_control.v5.ScreenDef} ScreenDef instance
             */
            ScreenDef.create = function create(properties) {
                return new ScreenDef(properties);
            };

            /**
             * Encodes the specified ScreenDef message. Does not implicitly {@link esp_control.v5.ScreenDef.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.ScreenDef
             * @static
             * @param {esp_control.v5.IScreenDef} message ScreenDef message or plain object to encode
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
                        $root.esp_control.v5.Rule.encode(message.entryRules[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ScreenDef message, length delimited. Does not implicitly {@link esp_control.v5.ScreenDef.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.ScreenDef
             * @static
             * @param {esp_control.v5.IScreenDef} message ScreenDef message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ScreenDef.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ScreenDef message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.ScreenDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.ScreenDef} ScreenDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ScreenDef.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.ScreenDef();
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
                            message.entryRules.push($root.esp_control.v5.Rule.decode(reader, reader.uint32()));
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
             * @memberof esp_control.v5.ScreenDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.ScreenDef} ScreenDef
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
             * @memberof esp_control.v5.ScreenDef
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
                        let error = $root.esp_control.v5.Rule.verify(message.entryRules[i]);
                        if (error)
                            return "entryRules." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ScreenDef message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof esp_control.v5.ScreenDef
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.ScreenDef} ScreenDef
             */
            ScreenDef.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.ScreenDef)
                    return object;
                let message = new $root.esp_control.v5.ScreenDef();
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
                        throw TypeError(".esp_control.v5.ScreenDef.entryRules: array expected");
                    message.entryRules = [];
                    for (let i = 0; i < object.entryRules.length; ++i) {
                        if (typeof object.entryRules[i] !== "object")
                            throw TypeError(".esp_control.v5.ScreenDef.entryRules: object expected");
                        message.entryRules[i] = $root.esp_control.v5.Rule.fromObject(object.entryRules[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a ScreenDef message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.ScreenDef
             * @static
             * @param {esp_control.v5.ScreenDef} message ScreenDef
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
                        object.entryRules[j] = $root.esp_control.v5.Rule.toObject(message.entryRules[j], options);
                }
                return object;
            };

            /**
             * Converts this ScreenDef to JSON.
             * @function toJSON
             * @memberof esp_control.v5.ScreenDef
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ScreenDef.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ScreenDef
             * @function getTypeUrl
             * @memberof esp_control.v5.ScreenDef
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ScreenDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.ScreenDef";
            };

            return ScreenDef;
        })();

        v5.BindingDef = (function() {

            /**
             * Properties of a BindingDef.
             * @memberof esp_control.v5
             * @interface IBindingDef
             * @property {number|null} [resourceId] BindingDef resourceId
             * @property {number|null} [actionId] BindingDef actionId
             */

            /**
             * Constructs a new BindingDef.
             * @memberof esp_control.v5
             * @classdesc Represents a BindingDef.
             * @implements IBindingDef
             * @constructor
             * @param {esp_control.v5.IBindingDef=} [properties] Properties to set
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
             * @memberof esp_control.v5.BindingDef
             * @instance
             */
            BindingDef.prototype.resourceId = 0;

            /**
             * BindingDef actionId.
             * @member {number} actionId
             * @memberof esp_control.v5.BindingDef
             * @instance
             */
            BindingDef.prototype.actionId = 0;

            /**
             * Creates a new BindingDef instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.BindingDef
             * @static
             * @param {esp_control.v5.IBindingDef=} [properties] Properties to set
             * @returns {esp_control.v5.BindingDef} BindingDef instance
             */
            BindingDef.create = function create(properties) {
                return new BindingDef(properties);
            };

            /**
             * Encodes the specified BindingDef message. Does not implicitly {@link esp_control.v5.BindingDef.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.BindingDef
             * @static
             * @param {esp_control.v5.IBindingDef} message BindingDef message or plain object to encode
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
             * Encodes the specified BindingDef message, length delimited. Does not implicitly {@link esp_control.v5.BindingDef.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.BindingDef
             * @static
             * @param {esp_control.v5.IBindingDef} message BindingDef message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BindingDef.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a BindingDef message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.BindingDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.BindingDef} BindingDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BindingDef.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.BindingDef();
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
             * @memberof esp_control.v5.BindingDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.BindingDef} BindingDef
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
             * @memberof esp_control.v5.BindingDef
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
             * @memberof esp_control.v5.BindingDef
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.BindingDef} BindingDef
             */
            BindingDef.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.BindingDef)
                    return object;
                let message = new $root.esp_control.v5.BindingDef();
                if (object.resourceId != null)
                    message.resourceId = object.resourceId >>> 0;
                if (object.actionId != null)
                    message.actionId = object.actionId >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a BindingDef message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.BindingDef
             * @static
             * @param {esp_control.v5.BindingDef} message BindingDef
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
             * @memberof esp_control.v5.BindingDef
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            BindingDef.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for BindingDef
             * @function getTypeUrl
             * @memberof esp_control.v5.BindingDef
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            BindingDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.BindingDef";
            };

            return BindingDef;
        })();

        v5.NodeDef = (function() {

            /**
             * Properties of a NodeDef.
             * @memberof esp_control.v5
             * @interface INodeDef
             * @property {number|null} [id] NodeDef id
             * @property {number|null} [slugIdx] NodeDef slugIdx
             * @property {esp_control.v5.NodeKind|null} [kind] NodeDef kind
             * @property {esp_control.v5.WidgetKind|null} [widgetKind] NodeDef widgetKind
             * @property {number|null} [titleIdx] NodeDef titleIdx
             * @property {number|null} [toneIdx] NodeDef toneIdx
             * @property {Array.<number>|null} [childrenIds] NodeDef childrenIds
             * @property {number|null} [columns] NodeDef columns
             * @property {esp_control.v5.IBindingDef|null} [bind] NodeDef bind
             * @property {esp_control.v5.IRule|null} [visibleIf] NodeDef visibleIf
             * @property {esp_control.v5.IRule|null} [enabledIf] NodeDef enabledIf
             * @property {number|null} [textIdx] NodeDef textIdx
             * @property {number|null} [formatHintIdx] NodeDef formatHintIdx
             */

            /**
             * Constructs a new NodeDef.
             * @memberof esp_control.v5
             * @classdesc Represents a NodeDef.
             * @implements INodeDef
             * @constructor
             * @param {esp_control.v5.INodeDef=} [properties] Properties to set
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
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.id = 0;

            /**
             * NodeDef slugIdx.
             * @member {number} slugIdx
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.slugIdx = 0;

            /**
             * NodeDef kind.
             * @member {esp_control.v5.NodeKind} kind
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.kind = 0;

            /**
             * NodeDef widgetKind.
             * @member {esp_control.v5.WidgetKind} widgetKind
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.widgetKind = 0;

            /**
             * NodeDef titleIdx.
             * @member {number} titleIdx
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.titleIdx = 0;

            /**
             * NodeDef toneIdx.
             * @member {number} toneIdx
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.toneIdx = 0;

            /**
             * NodeDef childrenIds.
             * @member {Array.<number>} childrenIds
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.childrenIds = $util.emptyArray;

            /**
             * NodeDef columns.
             * @member {number} columns
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.columns = 0;

            /**
             * NodeDef bind.
             * @member {esp_control.v5.IBindingDef|null|undefined} bind
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.bind = null;

            /**
             * NodeDef visibleIf.
             * @member {esp_control.v5.IRule|null|undefined} visibleIf
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.visibleIf = null;

            /**
             * NodeDef enabledIf.
             * @member {esp_control.v5.IRule|null|undefined} enabledIf
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.enabledIf = null;

            /**
             * NodeDef textIdx.
             * @member {number} textIdx
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.textIdx = 0;

            /**
             * NodeDef formatHintIdx.
             * @member {number} formatHintIdx
             * @memberof esp_control.v5.NodeDef
             * @instance
             */
            NodeDef.prototype.formatHintIdx = 0;

            /**
             * Creates a new NodeDef instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.NodeDef
             * @static
             * @param {esp_control.v5.INodeDef=} [properties] Properties to set
             * @returns {esp_control.v5.NodeDef} NodeDef instance
             */
            NodeDef.create = function create(properties) {
                return new NodeDef(properties);
            };

            /**
             * Encodes the specified NodeDef message. Does not implicitly {@link esp_control.v5.NodeDef.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.NodeDef
             * @static
             * @param {esp_control.v5.INodeDef} message NodeDef message or plain object to encode
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
                    $root.esp_control.v5.BindingDef.encode(message.bind, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                if (message.visibleIf != null && Object.hasOwnProperty.call(message, "visibleIf"))
                    $root.esp_control.v5.Rule.encode(message.visibleIf, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                if (message.enabledIf != null && Object.hasOwnProperty.call(message, "enabledIf"))
                    $root.esp_control.v5.Rule.encode(message.enabledIf, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                if (message.textIdx != null && Object.hasOwnProperty.call(message, "textIdx"))
                    writer.uint32(/* id 12, wireType 0 =*/96).uint32(message.textIdx);
                if (message.formatHintIdx != null && Object.hasOwnProperty.call(message, "formatHintIdx"))
                    writer.uint32(/* id 13, wireType 0 =*/104).uint32(message.formatHintIdx);
                return writer;
            };

            /**
             * Encodes the specified NodeDef message, length delimited. Does not implicitly {@link esp_control.v5.NodeDef.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.NodeDef
             * @static
             * @param {esp_control.v5.INodeDef} message NodeDef message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NodeDef.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a NodeDef message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.NodeDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.NodeDef} NodeDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NodeDef.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.NodeDef();
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
                            message.bind = $root.esp_control.v5.BindingDef.decode(reader, reader.uint32());
                            break;
                        }
                    case 10: {
                            message.visibleIf = $root.esp_control.v5.Rule.decode(reader, reader.uint32());
                            break;
                        }
                    case 11: {
                            message.enabledIf = $root.esp_control.v5.Rule.decode(reader, reader.uint32());
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
             * @memberof esp_control.v5.NodeDef
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.NodeDef} NodeDef
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
             * @memberof esp_control.v5.NodeDef
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
                    let error = $root.esp_control.v5.BindingDef.verify(message.bind);
                    if (error)
                        return "bind." + error;
                }
                if (message.visibleIf != null && message.hasOwnProperty("visibleIf")) {
                    let error = $root.esp_control.v5.Rule.verify(message.visibleIf);
                    if (error)
                        return "visibleIf." + error;
                }
                if (message.enabledIf != null && message.hasOwnProperty("enabledIf")) {
                    let error = $root.esp_control.v5.Rule.verify(message.enabledIf);
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
             * @memberof esp_control.v5.NodeDef
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.NodeDef} NodeDef
             */
            NodeDef.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.NodeDef)
                    return object;
                let message = new $root.esp_control.v5.NodeDef();
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
                        throw TypeError(".esp_control.v5.NodeDef.childrenIds: array expected");
                    message.childrenIds = [];
                    for (let i = 0; i < object.childrenIds.length; ++i)
                        message.childrenIds[i] = object.childrenIds[i] >>> 0;
                }
                if (object.columns != null)
                    message.columns = object.columns >>> 0;
                if (object.bind != null) {
                    if (typeof object.bind !== "object")
                        throw TypeError(".esp_control.v5.NodeDef.bind: object expected");
                    message.bind = $root.esp_control.v5.BindingDef.fromObject(object.bind);
                }
                if (object.visibleIf != null) {
                    if (typeof object.visibleIf !== "object")
                        throw TypeError(".esp_control.v5.NodeDef.visibleIf: object expected");
                    message.visibleIf = $root.esp_control.v5.Rule.fromObject(object.visibleIf);
                }
                if (object.enabledIf != null) {
                    if (typeof object.enabledIf !== "object")
                        throw TypeError(".esp_control.v5.NodeDef.enabledIf: object expected");
                    message.enabledIf = $root.esp_control.v5.Rule.fromObject(object.enabledIf);
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
             * @memberof esp_control.v5.NodeDef
             * @static
             * @param {esp_control.v5.NodeDef} message NodeDef
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
                    object.kind = options.enums === String ? $root.esp_control.v5.NodeKind[message.kind] === undefined ? message.kind : $root.esp_control.v5.NodeKind[message.kind] : message.kind;
                if (message.widgetKind != null && message.hasOwnProperty("widgetKind"))
                    object.widgetKind = options.enums === String ? $root.esp_control.v5.WidgetKind[message.widgetKind] === undefined ? message.widgetKind : $root.esp_control.v5.WidgetKind[message.widgetKind] : message.widgetKind;
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
                    object.bind = $root.esp_control.v5.BindingDef.toObject(message.bind, options);
                if (message.visibleIf != null && message.hasOwnProperty("visibleIf"))
                    object.visibleIf = $root.esp_control.v5.Rule.toObject(message.visibleIf, options);
                if (message.enabledIf != null && message.hasOwnProperty("enabledIf"))
                    object.enabledIf = $root.esp_control.v5.Rule.toObject(message.enabledIf, options);
                if (message.textIdx != null && message.hasOwnProperty("textIdx"))
                    object.textIdx = message.textIdx;
                if (message.formatHintIdx != null && message.hasOwnProperty("formatHintIdx"))
                    object.formatHintIdx = message.formatHintIdx;
                return object;
            };

            /**
             * Converts this NodeDef to JSON.
             * @function toJSON
             * @memberof esp_control.v5.NodeDef
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            NodeDef.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for NodeDef
             * @function getTypeUrl
             * @memberof esp_control.v5.NodeDef
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            NodeDef.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.NodeDef";
            };

            return NodeDef;
        })();

        v5.ManifestBundleV5 = (function() {

            /**
             * Properties of a ManifestBundleV5.
             * @memberof esp_control.v5
             * @interface IManifestBundleV5
             * @property {number|null} [version] ManifestBundleV5 version
             * @property {esp_control.v5.ICapabilitiesDef|null} [capabilities] ManifestBundleV5 capabilities
             * @property {Array.<esp_control.v5.IStringEntry>|null} [strings] ManifestBundleV5 strings
             * @property {Array.<esp_control.v5.IResourceDef>|null} [resources] ManifestBundleV5 resources
             * @property {Array.<esp_control.v5.IActionDef>|null} [actions] ManifestBundleV5 actions
             * @property {Array.<esp_control.v5.IScreenDef>|null} [screens] ManifestBundleV5 screens
             * @property {Array.<esp_control.v5.INodeDef>|null} [nodes] ManifestBundleV5 nodes
             */

            /**
             * Constructs a new ManifestBundleV5.
             * @memberof esp_control.v5
             * @classdesc Represents a ManifestBundleV5.
             * @implements IManifestBundleV5
             * @constructor
             * @param {esp_control.v5.IManifestBundleV5=} [properties] Properties to set
             */
            function ManifestBundleV5(properties) {
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
             * ManifestBundleV5 version.
             * @member {number} version
             * @memberof esp_control.v5.ManifestBundleV5
             * @instance
             */
            ManifestBundleV5.prototype.version = 0;

            /**
             * ManifestBundleV5 capabilities.
             * @member {esp_control.v5.ICapabilitiesDef|null|undefined} capabilities
             * @memberof esp_control.v5.ManifestBundleV5
             * @instance
             */
            ManifestBundleV5.prototype.capabilities = null;

            /**
             * ManifestBundleV5 strings.
             * @member {Array.<esp_control.v5.IStringEntry>} strings
             * @memberof esp_control.v5.ManifestBundleV5
             * @instance
             */
            ManifestBundleV5.prototype.strings = $util.emptyArray;

            /**
             * ManifestBundleV5 resources.
             * @member {Array.<esp_control.v5.IResourceDef>} resources
             * @memberof esp_control.v5.ManifestBundleV5
             * @instance
             */
            ManifestBundleV5.prototype.resources = $util.emptyArray;

            /**
             * ManifestBundleV5 actions.
             * @member {Array.<esp_control.v5.IActionDef>} actions
             * @memberof esp_control.v5.ManifestBundleV5
             * @instance
             */
            ManifestBundleV5.prototype.actions = $util.emptyArray;

            /**
             * ManifestBundleV5 screens.
             * @member {Array.<esp_control.v5.IScreenDef>} screens
             * @memberof esp_control.v5.ManifestBundleV5
             * @instance
             */
            ManifestBundleV5.prototype.screens = $util.emptyArray;

            /**
             * ManifestBundleV5 nodes.
             * @member {Array.<esp_control.v5.INodeDef>} nodes
             * @memberof esp_control.v5.ManifestBundleV5
             * @instance
             */
            ManifestBundleV5.prototype.nodes = $util.emptyArray;

            /**
             * Creates a new ManifestBundleV5 instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.ManifestBundleV5
             * @static
             * @param {esp_control.v5.IManifestBundleV5=} [properties] Properties to set
             * @returns {esp_control.v5.ManifestBundleV5} ManifestBundleV5 instance
             */
            ManifestBundleV5.create = function create(properties) {
                return new ManifestBundleV5(properties);
            };

            /**
             * Encodes the specified ManifestBundleV5 message. Does not implicitly {@link esp_control.v5.ManifestBundleV5.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.ManifestBundleV5
             * @static
             * @param {esp_control.v5.IManifestBundleV5} message ManifestBundleV5 message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ManifestBundleV5.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.version);
                if (message.capabilities != null && Object.hasOwnProperty.call(message, "capabilities"))
                    $root.esp_control.v5.CapabilitiesDef.encode(message.capabilities, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.strings != null && message.strings.length)
                    for (let i = 0; i < message.strings.length; ++i)
                        $root.esp_control.v5.StringEntry.encode(message.strings[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.resources != null && message.resources.length)
                    for (let i = 0; i < message.resources.length; ++i)
                        $root.esp_control.v5.ResourceDef.encode(message.resources[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.actions != null && message.actions.length)
                    for (let i = 0; i < message.actions.length; ++i)
                        $root.esp_control.v5.ActionDef.encode(message.actions[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.screens != null && message.screens.length)
                    for (let i = 0; i < message.screens.length; ++i)
                        $root.esp_control.v5.ScreenDef.encode(message.screens[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.nodes != null && message.nodes.length)
                    for (let i = 0; i < message.nodes.length; ++i)
                        $root.esp_control.v5.NodeDef.encode(message.nodes[i], writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ManifestBundleV5 message, length delimited. Does not implicitly {@link esp_control.v5.ManifestBundleV5.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.ManifestBundleV5
             * @static
             * @param {esp_control.v5.IManifestBundleV5} message ManifestBundleV5 message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ManifestBundleV5.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ManifestBundleV5 message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.ManifestBundleV5
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.ManifestBundleV5} ManifestBundleV5
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ManifestBundleV5.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.ManifestBundleV5();
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
                            message.capabilities = $root.esp_control.v5.CapabilitiesDef.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            if (!(message.strings && message.strings.length))
                                message.strings = [];
                            message.strings.push($root.esp_control.v5.StringEntry.decode(reader, reader.uint32()));
                            break;
                        }
                    case 4: {
                            if (!(message.resources && message.resources.length))
                                message.resources = [];
                            message.resources.push($root.esp_control.v5.ResourceDef.decode(reader, reader.uint32()));
                            break;
                        }
                    case 5: {
                            if (!(message.actions && message.actions.length))
                                message.actions = [];
                            message.actions.push($root.esp_control.v5.ActionDef.decode(reader, reader.uint32()));
                            break;
                        }
                    case 6: {
                            if (!(message.screens && message.screens.length))
                                message.screens = [];
                            message.screens.push($root.esp_control.v5.ScreenDef.decode(reader, reader.uint32()));
                            break;
                        }
                    case 7: {
                            if (!(message.nodes && message.nodes.length))
                                message.nodes = [];
                            message.nodes.push($root.esp_control.v5.NodeDef.decode(reader, reader.uint32()));
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
             * Decodes a ManifestBundleV5 message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof esp_control.v5.ManifestBundleV5
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.ManifestBundleV5} ManifestBundleV5
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ManifestBundleV5.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ManifestBundleV5 message.
             * @function verify
             * @memberof esp_control.v5.ManifestBundleV5
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ManifestBundleV5.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isInteger(message.version))
                        return "version: integer expected";
                if (message.capabilities != null && message.hasOwnProperty("capabilities")) {
                    let error = $root.esp_control.v5.CapabilitiesDef.verify(message.capabilities);
                    if (error)
                        return "capabilities." + error;
                }
                if (message.strings != null && message.hasOwnProperty("strings")) {
                    if (!Array.isArray(message.strings))
                        return "strings: array expected";
                    for (let i = 0; i < message.strings.length; ++i) {
                        let error = $root.esp_control.v5.StringEntry.verify(message.strings[i]);
                        if (error)
                            return "strings." + error;
                    }
                }
                if (message.resources != null && message.hasOwnProperty("resources")) {
                    if (!Array.isArray(message.resources))
                        return "resources: array expected";
                    for (let i = 0; i < message.resources.length; ++i) {
                        let error = $root.esp_control.v5.ResourceDef.verify(message.resources[i]);
                        if (error)
                            return "resources." + error;
                    }
                }
                if (message.actions != null && message.hasOwnProperty("actions")) {
                    if (!Array.isArray(message.actions))
                        return "actions: array expected";
                    for (let i = 0; i < message.actions.length; ++i) {
                        let error = $root.esp_control.v5.ActionDef.verify(message.actions[i]);
                        if (error)
                            return "actions." + error;
                    }
                }
                if (message.screens != null && message.hasOwnProperty("screens")) {
                    if (!Array.isArray(message.screens))
                        return "screens: array expected";
                    for (let i = 0; i < message.screens.length; ++i) {
                        let error = $root.esp_control.v5.ScreenDef.verify(message.screens[i]);
                        if (error)
                            return "screens." + error;
                    }
                }
                if (message.nodes != null && message.hasOwnProperty("nodes")) {
                    if (!Array.isArray(message.nodes))
                        return "nodes: array expected";
                    for (let i = 0; i < message.nodes.length; ++i) {
                        let error = $root.esp_control.v5.NodeDef.verify(message.nodes[i]);
                        if (error)
                            return "nodes." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ManifestBundleV5 message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof esp_control.v5.ManifestBundleV5
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.ManifestBundleV5} ManifestBundleV5
             */
            ManifestBundleV5.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.ManifestBundleV5)
                    return object;
                let message = new $root.esp_control.v5.ManifestBundleV5();
                if (object.version != null)
                    message.version = object.version >>> 0;
                if (object.capabilities != null) {
                    if (typeof object.capabilities !== "object")
                        throw TypeError(".esp_control.v5.ManifestBundleV5.capabilities: object expected");
                    message.capabilities = $root.esp_control.v5.CapabilitiesDef.fromObject(object.capabilities);
                }
                if (object.strings) {
                    if (!Array.isArray(object.strings))
                        throw TypeError(".esp_control.v5.ManifestBundleV5.strings: array expected");
                    message.strings = [];
                    for (let i = 0; i < object.strings.length; ++i) {
                        if (typeof object.strings[i] !== "object")
                            throw TypeError(".esp_control.v5.ManifestBundleV5.strings: object expected");
                        message.strings[i] = $root.esp_control.v5.StringEntry.fromObject(object.strings[i]);
                    }
                }
                if (object.resources) {
                    if (!Array.isArray(object.resources))
                        throw TypeError(".esp_control.v5.ManifestBundleV5.resources: array expected");
                    message.resources = [];
                    for (let i = 0; i < object.resources.length; ++i) {
                        if (typeof object.resources[i] !== "object")
                            throw TypeError(".esp_control.v5.ManifestBundleV5.resources: object expected");
                        message.resources[i] = $root.esp_control.v5.ResourceDef.fromObject(object.resources[i]);
                    }
                }
                if (object.actions) {
                    if (!Array.isArray(object.actions))
                        throw TypeError(".esp_control.v5.ManifestBundleV5.actions: array expected");
                    message.actions = [];
                    for (let i = 0; i < object.actions.length; ++i) {
                        if (typeof object.actions[i] !== "object")
                            throw TypeError(".esp_control.v5.ManifestBundleV5.actions: object expected");
                        message.actions[i] = $root.esp_control.v5.ActionDef.fromObject(object.actions[i]);
                    }
                }
                if (object.screens) {
                    if (!Array.isArray(object.screens))
                        throw TypeError(".esp_control.v5.ManifestBundleV5.screens: array expected");
                    message.screens = [];
                    for (let i = 0; i < object.screens.length; ++i) {
                        if (typeof object.screens[i] !== "object")
                            throw TypeError(".esp_control.v5.ManifestBundleV5.screens: object expected");
                        message.screens[i] = $root.esp_control.v5.ScreenDef.fromObject(object.screens[i]);
                    }
                }
                if (object.nodes) {
                    if (!Array.isArray(object.nodes))
                        throw TypeError(".esp_control.v5.ManifestBundleV5.nodes: array expected");
                    message.nodes = [];
                    for (let i = 0; i < object.nodes.length; ++i) {
                        if (typeof object.nodes[i] !== "object")
                            throw TypeError(".esp_control.v5.ManifestBundleV5.nodes: object expected");
                        message.nodes[i] = $root.esp_control.v5.NodeDef.fromObject(object.nodes[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a ManifestBundleV5 message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.ManifestBundleV5
             * @static
             * @param {esp_control.v5.ManifestBundleV5} message ManifestBundleV5
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ManifestBundleV5.toObject = function toObject(message, options) {
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
                    object.capabilities = null;
                }
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.capabilities != null && message.hasOwnProperty("capabilities"))
                    object.capabilities = $root.esp_control.v5.CapabilitiesDef.toObject(message.capabilities, options);
                if (message.strings && message.strings.length) {
                    object.strings = [];
                    for (let j = 0; j < message.strings.length; ++j)
                        object.strings[j] = $root.esp_control.v5.StringEntry.toObject(message.strings[j], options);
                }
                if (message.resources && message.resources.length) {
                    object.resources = [];
                    for (let j = 0; j < message.resources.length; ++j)
                        object.resources[j] = $root.esp_control.v5.ResourceDef.toObject(message.resources[j], options);
                }
                if (message.actions && message.actions.length) {
                    object.actions = [];
                    for (let j = 0; j < message.actions.length; ++j)
                        object.actions[j] = $root.esp_control.v5.ActionDef.toObject(message.actions[j], options);
                }
                if (message.screens && message.screens.length) {
                    object.screens = [];
                    for (let j = 0; j < message.screens.length; ++j)
                        object.screens[j] = $root.esp_control.v5.ScreenDef.toObject(message.screens[j], options);
                }
                if (message.nodes && message.nodes.length) {
                    object.nodes = [];
                    for (let j = 0; j < message.nodes.length; ++j)
                        object.nodes[j] = $root.esp_control.v5.NodeDef.toObject(message.nodes[j], options);
                }
                return object;
            };

            /**
             * Converts this ManifestBundleV5 to JSON.
             * @function toJSON
             * @memberof esp_control.v5.ManifestBundleV5
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ManifestBundleV5.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ManifestBundleV5
             * @function getTypeUrl
             * @memberof esp_control.v5.ManifestBundleV5
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ManifestBundleV5.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.ManifestBundleV5";
            };

            return ManifestBundleV5;
        })();

        /**
         * Status enum.
         * @name esp_control.v5.Status
         * @enum {number}
         * @property {number} STATUS_UNSPECIFIED=0 STATUS_UNSPECIFIED value
         * @property {number} STATUS_OK=1 STATUS_OK value
         * @property {number} STATUS_BAD_PAYLOAD=2 STATUS_BAD_PAYLOAD value
         * @property {number} STATUS_UNKNOWN_ACTION=3 STATUS_UNKNOWN_ACTION value
         * @property {number} STATUS_UNAUTHORIZED=4 STATUS_UNAUTHORIZED value
         * @property {number} STATUS_INTERNAL=5 STATUS_INTERNAL value
         */
        v5.Status = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "STATUS_UNSPECIFIED"] = 0;
            values[valuesById[1] = "STATUS_OK"] = 1;
            values[valuesById[2] = "STATUS_BAD_PAYLOAD"] = 2;
            values[valuesById[3] = "STATUS_UNKNOWN_ACTION"] = 3;
            values[valuesById[4] = "STATUS_UNAUTHORIZED"] = 4;
            values[valuesById[5] = "STATUS_INTERNAL"] = 5;
            return values;
        })();

        v5.ResourceValue = (function() {

            /**
             * Properties of a ResourceValue.
             * @memberof esp_control.v5
             * @interface IResourceValue
             * @property {number|null} [resourceId] ResourceValue resourceId
             * @property {boolean|null} [boolValue] ResourceValue boolValue
             * @property {number|null} [intValue] ResourceValue intValue
             * @property {number|null} [uintValue] ResourceValue uintValue
             * @property {string|null} [stringValue] ResourceValue stringValue
             * @property {Uint8Array|null} [bytesValue] ResourceValue bytesValue
             */

            /**
             * Constructs a new ResourceValue.
             * @memberof esp_control.v5
             * @classdesc Represents a ResourceValue.
             * @implements IResourceValue
             * @constructor
             * @param {esp_control.v5.IResourceValue=} [properties] Properties to set
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
             * @memberof esp_control.v5.ResourceValue
             * @instance
             */
            ResourceValue.prototype.resourceId = 0;

            /**
             * ResourceValue boolValue.
             * @member {boolean|null|undefined} boolValue
             * @memberof esp_control.v5.ResourceValue
             * @instance
             */
            ResourceValue.prototype.boolValue = null;

            /**
             * ResourceValue intValue.
             * @member {number|null|undefined} intValue
             * @memberof esp_control.v5.ResourceValue
             * @instance
             */
            ResourceValue.prototype.intValue = null;

            /**
             * ResourceValue uintValue.
             * @member {number|null|undefined} uintValue
             * @memberof esp_control.v5.ResourceValue
             * @instance
             */
            ResourceValue.prototype.uintValue = null;

            /**
             * ResourceValue stringValue.
             * @member {string|null|undefined} stringValue
             * @memberof esp_control.v5.ResourceValue
             * @instance
             */
            ResourceValue.prototype.stringValue = null;

            /**
             * ResourceValue bytesValue.
             * @member {Uint8Array|null|undefined} bytesValue
             * @memberof esp_control.v5.ResourceValue
             * @instance
             */
            ResourceValue.prototype.bytesValue = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * ResourceValue value.
             * @member {"boolValue"|"intValue"|"uintValue"|"stringValue"|"bytesValue"|undefined} value
             * @memberof esp_control.v5.ResourceValue
             * @instance
             */
            Object.defineProperty(ResourceValue.prototype, "value", {
                get: $util.oneOfGetter($oneOfFields = ["boolValue", "intValue", "uintValue", "stringValue", "bytesValue"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new ResourceValue instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.ResourceValue
             * @static
             * @param {esp_control.v5.IResourceValue=} [properties] Properties to set
             * @returns {esp_control.v5.ResourceValue} ResourceValue instance
             */
            ResourceValue.create = function create(properties) {
                return new ResourceValue(properties);
            };

            /**
             * Encodes the specified ResourceValue message. Does not implicitly {@link esp_control.v5.ResourceValue.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.ResourceValue
             * @static
             * @param {esp_control.v5.IResourceValue} message ResourceValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ResourceValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.resourceId != null && Object.hasOwnProperty.call(message, "resourceId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.resourceId);
                if (message.boolValue != null && Object.hasOwnProperty.call(message, "boolValue"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.boolValue);
                if (message.intValue != null && Object.hasOwnProperty.call(message, "intValue"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.intValue);
                if (message.uintValue != null && Object.hasOwnProperty.call(message, "uintValue"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.uintValue);
                if (message.stringValue != null && Object.hasOwnProperty.call(message, "stringValue"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.stringValue);
                if (message.bytesValue != null && Object.hasOwnProperty.call(message, "bytesValue"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.bytesValue);
                return writer;
            };

            /**
             * Encodes the specified ResourceValue message, length delimited. Does not implicitly {@link esp_control.v5.ResourceValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.ResourceValue
             * @static
             * @param {esp_control.v5.IResourceValue} message ResourceValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ResourceValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ResourceValue message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.ResourceValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.ResourceValue} ResourceValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ResourceValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.ResourceValue();
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
                            message.boolValue = reader.bool();
                            break;
                        }
                    case 3: {
                            message.intValue = reader.int32();
                            break;
                        }
                    case 4: {
                            message.uintValue = reader.uint32();
                            break;
                        }
                    case 5: {
                            message.stringValue = reader.string();
                            break;
                        }
                    case 6: {
                            message.bytesValue = reader.bytes();
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
             * @memberof esp_control.v5.ResourceValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.ResourceValue} ResourceValue
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
             * @memberof esp_control.v5.ResourceValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ResourceValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                let properties = {};
                if (message.resourceId != null && message.hasOwnProperty("resourceId"))
                    if (!$util.isInteger(message.resourceId))
                        return "resourceId: integer expected";
                if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                    properties.value = 1;
                    if (typeof message.boolValue !== "boolean")
                        return "boolValue: boolean expected";
                }
                if (message.intValue != null && message.hasOwnProperty("intValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!$util.isInteger(message.intValue))
                        return "intValue: integer expected";
                }
                if (message.uintValue != null && message.hasOwnProperty("uintValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!$util.isInteger(message.uintValue))
                        return "uintValue: integer expected";
                }
                if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!$util.isString(message.stringValue))
                        return "stringValue: string expected";
                }
                if (message.bytesValue != null && message.hasOwnProperty("bytesValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!(message.bytesValue && typeof message.bytesValue.length === "number" || $util.isString(message.bytesValue)))
                        return "bytesValue: buffer expected";
                }
                return null;
            };

            /**
             * Creates a ResourceValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof esp_control.v5.ResourceValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.ResourceValue} ResourceValue
             */
            ResourceValue.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.ResourceValue)
                    return object;
                let message = new $root.esp_control.v5.ResourceValue();
                if (object.resourceId != null)
                    message.resourceId = object.resourceId >>> 0;
                if (object.boolValue != null)
                    message.boolValue = Boolean(object.boolValue);
                if (object.intValue != null)
                    message.intValue = object.intValue | 0;
                if (object.uintValue != null)
                    message.uintValue = object.uintValue >>> 0;
                if (object.stringValue != null)
                    message.stringValue = String(object.stringValue);
                if (object.bytesValue != null)
                    if (typeof object.bytesValue === "string")
                        $util.base64.decode(object.bytesValue, message.bytesValue = $util.newBuffer($util.base64.length(object.bytesValue)), 0);
                    else if (object.bytesValue.length >= 0)
                        message.bytesValue = object.bytesValue;
                return message;
            };

            /**
             * Creates a plain object from a ResourceValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.ResourceValue
             * @static
             * @param {esp_control.v5.ResourceValue} message ResourceValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ResourceValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.resourceId = 0;
                if (message.resourceId != null && message.hasOwnProperty("resourceId"))
                    object.resourceId = message.resourceId;
                if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                    object.boolValue = message.boolValue;
                    if (options.oneofs)
                        object.value = "boolValue";
                }
                if (message.intValue != null && message.hasOwnProperty("intValue")) {
                    object.intValue = message.intValue;
                    if (options.oneofs)
                        object.value = "intValue";
                }
                if (message.uintValue != null && message.hasOwnProperty("uintValue")) {
                    object.uintValue = message.uintValue;
                    if (options.oneofs)
                        object.value = "uintValue";
                }
                if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                    object.stringValue = message.stringValue;
                    if (options.oneofs)
                        object.value = "stringValue";
                }
                if (message.bytesValue != null && message.hasOwnProperty("bytesValue")) {
                    object.bytesValue = options.bytes === String ? $util.base64.encode(message.bytesValue, 0, message.bytesValue.length) : options.bytes === Array ? Array.prototype.slice.call(message.bytesValue) : message.bytesValue;
                    if (options.oneofs)
                        object.value = "bytesValue";
                }
                return object;
            };

            /**
             * Converts this ResourceValue to JSON.
             * @function toJSON
             * @memberof esp_control.v5.ResourceValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ResourceValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ResourceValue
             * @function getTypeUrl
             * @memberof esp_control.v5.ResourceValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ResourceValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.ResourceValue";
            };

            return ResourceValue;
        })();

        v5.ResourceSnapshot = (function() {

            /**
             * Properties of a ResourceSnapshot.
             * @memberof esp_control.v5
             * @interface IResourceSnapshot
             * @property {Array.<esp_control.v5.IResourceValue>|null} [values] ResourceSnapshot values
             * @property {number|null} [generation] ResourceSnapshot generation
             */

            /**
             * Constructs a new ResourceSnapshot.
             * @memberof esp_control.v5
             * @classdesc Represents a ResourceSnapshot.
             * @implements IResourceSnapshot
             * @constructor
             * @param {esp_control.v5.IResourceSnapshot=} [properties] Properties to set
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
             * @member {Array.<esp_control.v5.IResourceValue>} values
             * @memberof esp_control.v5.ResourceSnapshot
             * @instance
             */
            ResourceSnapshot.prototype.values = $util.emptyArray;

            /**
             * ResourceSnapshot generation.
             * @member {number} generation
             * @memberof esp_control.v5.ResourceSnapshot
             * @instance
             */
            ResourceSnapshot.prototype.generation = 0;

            /**
             * Creates a new ResourceSnapshot instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.ResourceSnapshot
             * @static
             * @param {esp_control.v5.IResourceSnapshot=} [properties] Properties to set
             * @returns {esp_control.v5.ResourceSnapshot} ResourceSnapshot instance
             */
            ResourceSnapshot.create = function create(properties) {
                return new ResourceSnapshot(properties);
            };

            /**
             * Encodes the specified ResourceSnapshot message. Does not implicitly {@link esp_control.v5.ResourceSnapshot.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.ResourceSnapshot
             * @static
             * @param {esp_control.v5.IResourceSnapshot} message ResourceSnapshot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ResourceSnapshot.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.values != null && message.values.length)
                    for (let i = 0; i < message.values.length; ++i)
                        $root.esp_control.v5.ResourceValue.encode(message.values[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.generation != null && Object.hasOwnProperty.call(message, "generation"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.generation);
                return writer;
            };

            /**
             * Encodes the specified ResourceSnapshot message, length delimited. Does not implicitly {@link esp_control.v5.ResourceSnapshot.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.ResourceSnapshot
             * @static
             * @param {esp_control.v5.IResourceSnapshot} message ResourceSnapshot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ResourceSnapshot.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ResourceSnapshot message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.ResourceSnapshot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.ResourceSnapshot} ResourceSnapshot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ResourceSnapshot.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.ResourceSnapshot();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.values && message.values.length))
                                message.values = [];
                            message.values.push($root.esp_control.v5.ResourceValue.decode(reader, reader.uint32()));
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
             * @memberof esp_control.v5.ResourceSnapshot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.ResourceSnapshot} ResourceSnapshot
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
             * @memberof esp_control.v5.ResourceSnapshot
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
                        let error = $root.esp_control.v5.ResourceValue.verify(message.values[i]);
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
             * @memberof esp_control.v5.ResourceSnapshot
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.ResourceSnapshot} ResourceSnapshot
             */
            ResourceSnapshot.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.ResourceSnapshot)
                    return object;
                let message = new $root.esp_control.v5.ResourceSnapshot();
                if (object.values) {
                    if (!Array.isArray(object.values))
                        throw TypeError(".esp_control.v5.ResourceSnapshot.values: array expected");
                    message.values = [];
                    for (let i = 0; i < object.values.length; ++i) {
                        if (typeof object.values[i] !== "object")
                            throw TypeError(".esp_control.v5.ResourceSnapshot.values: object expected");
                        message.values[i] = $root.esp_control.v5.ResourceValue.fromObject(object.values[i]);
                    }
                }
                if (object.generation != null)
                    message.generation = object.generation >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a ResourceSnapshot message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.ResourceSnapshot
             * @static
             * @param {esp_control.v5.ResourceSnapshot} message ResourceSnapshot
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
                        object.values[j] = $root.esp_control.v5.ResourceValue.toObject(message.values[j], options);
                }
                if (message.generation != null && message.hasOwnProperty("generation"))
                    object.generation = message.generation;
                return object;
            };

            /**
             * Converts this ResourceSnapshot to JSON.
             * @function toJSON
             * @memberof esp_control.v5.ResourceSnapshot
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ResourceSnapshot.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ResourceSnapshot
             * @function getTypeUrl
             * @memberof esp_control.v5.ResourceSnapshot
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ResourceSnapshot.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.ResourceSnapshot";
            };

            return ResourceSnapshot;
        })();

        v5.ResourceDelta = (function() {

            /**
             * Properties of a ResourceDelta.
             * @memberof esp_control.v5
             * @interface IResourceDelta
             * @property {number|null} [resourceId] ResourceDelta resourceId
             * @property {boolean|null} [boolValue] ResourceDelta boolValue
             * @property {number|null} [intValue] ResourceDelta intValue
             * @property {number|null} [uintValue] ResourceDelta uintValue
             * @property {string|null} [stringValue] ResourceDelta stringValue
             * @property {Uint8Array|null} [bytesValue] ResourceDelta bytesValue
             * @property {number|null} [generation] ResourceDelta generation
             */

            /**
             * Constructs a new ResourceDelta.
             * @memberof esp_control.v5
             * @classdesc Represents a ResourceDelta.
             * @implements IResourceDelta
             * @constructor
             * @param {esp_control.v5.IResourceDelta=} [properties] Properties to set
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
             * @memberof esp_control.v5.ResourceDelta
             * @instance
             */
            ResourceDelta.prototype.resourceId = 0;

            /**
             * ResourceDelta boolValue.
             * @member {boolean|null|undefined} boolValue
             * @memberof esp_control.v5.ResourceDelta
             * @instance
             */
            ResourceDelta.prototype.boolValue = null;

            /**
             * ResourceDelta intValue.
             * @member {number|null|undefined} intValue
             * @memberof esp_control.v5.ResourceDelta
             * @instance
             */
            ResourceDelta.prototype.intValue = null;

            /**
             * ResourceDelta uintValue.
             * @member {number|null|undefined} uintValue
             * @memberof esp_control.v5.ResourceDelta
             * @instance
             */
            ResourceDelta.prototype.uintValue = null;

            /**
             * ResourceDelta stringValue.
             * @member {string|null|undefined} stringValue
             * @memberof esp_control.v5.ResourceDelta
             * @instance
             */
            ResourceDelta.prototype.stringValue = null;

            /**
             * ResourceDelta bytesValue.
             * @member {Uint8Array|null|undefined} bytesValue
             * @memberof esp_control.v5.ResourceDelta
             * @instance
             */
            ResourceDelta.prototype.bytesValue = null;

            /**
             * ResourceDelta generation.
             * @member {number} generation
             * @memberof esp_control.v5.ResourceDelta
             * @instance
             */
            ResourceDelta.prototype.generation = 0;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * ResourceDelta value.
             * @member {"boolValue"|"intValue"|"uintValue"|"stringValue"|"bytesValue"|undefined} value
             * @memberof esp_control.v5.ResourceDelta
             * @instance
             */
            Object.defineProperty(ResourceDelta.prototype, "value", {
                get: $util.oneOfGetter($oneOfFields = ["boolValue", "intValue", "uintValue", "stringValue", "bytesValue"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new ResourceDelta instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.ResourceDelta
             * @static
             * @param {esp_control.v5.IResourceDelta=} [properties] Properties to set
             * @returns {esp_control.v5.ResourceDelta} ResourceDelta instance
             */
            ResourceDelta.create = function create(properties) {
                return new ResourceDelta(properties);
            };

            /**
             * Encodes the specified ResourceDelta message. Does not implicitly {@link esp_control.v5.ResourceDelta.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.ResourceDelta
             * @static
             * @param {esp_control.v5.IResourceDelta} message ResourceDelta message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ResourceDelta.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.resourceId != null && Object.hasOwnProperty.call(message, "resourceId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.resourceId);
                if (message.boolValue != null && Object.hasOwnProperty.call(message, "boolValue"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.boolValue);
                if (message.intValue != null && Object.hasOwnProperty.call(message, "intValue"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.intValue);
                if (message.uintValue != null && Object.hasOwnProperty.call(message, "uintValue"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.uintValue);
                if (message.stringValue != null && Object.hasOwnProperty.call(message, "stringValue"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.stringValue);
                if (message.bytesValue != null && Object.hasOwnProperty.call(message, "bytesValue"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.bytesValue);
                if (message.generation != null && Object.hasOwnProperty.call(message, "generation"))
                    writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.generation);
                return writer;
            };

            /**
             * Encodes the specified ResourceDelta message, length delimited. Does not implicitly {@link esp_control.v5.ResourceDelta.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.ResourceDelta
             * @static
             * @param {esp_control.v5.IResourceDelta} message ResourceDelta message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ResourceDelta.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ResourceDelta message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.ResourceDelta
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.ResourceDelta} ResourceDelta
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ResourceDelta.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.ResourceDelta();
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
                            message.boolValue = reader.bool();
                            break;
                        }
                    case 3: {
                            message.intValue = reader.int32();
                            break;
                        }
                    case 4: {
                            message.uintValue = reader.uint32();
                            break;
                        }
                    case 5: {
                            message.stringValue = reader.string();
                            break;
                        }
                    case 6: {
                            message.bytesValue = reader.bytes();
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
             * @memberof esp_control.v5.ResourceDelta
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.ResourceDelta} ResourceDelta
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
             * @memberof esp_control.v5.ResourceDelta
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ResourceDelta.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                let properties = {};
                if (message.resourceId != null && message.hasOwnProperty("resourceId"))
                    if (!$util.isInteger(message.resourceId))
                        return "resourceId: integer expected";
                if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                    properties.value = 1;
                    if (typeof message.boolValue !== "boolean")
                        return "boolValue: boolean expected";
                }
                if (message.intValue != null && message.hasOwnProperty("intValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!$util.isInteger(message.intValue))
                        return "intValue: integer expected";
                }
                if (message.uintValue != null && message.hasOwnProperty("uintValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!$util.isInteger(message.uintValue))
                        return "uintValue: integer expected";
                }
                if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!$util.isString(message.stringValue))
                        return "stringValue: string expected";
                }
                if (message.bytesValue != null && message.hasOwnProperty("bytesValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!(message.bytesValue && typeof message.bytesValue.length === "number" || $util.isString(message.bytesValue)))
                        return "bytesValue: buffer expected";
                }
                if (message.generation != null && message.hasOwnProperty("generation"))
                    if (!$util.isInteger(message.generation))
                        return "generation: integer expected";
                return null;
            };

            /**
             * Creates a ResourceDelta message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof esp_control.v5.ResourceDelta
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.ResourceDelta} ResourceDelta
             */
            ResourceDelta.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.ResourceDelta)
                    return object;
                let message = new $root.esp_control.v5.ResourceDelta();
                if (object.resourceId != null)
                    message.resourceId = object.resourceId >>> 0;
                if (object.boolValue != null)
                    message.boolValue = Boolean(object.boolValue);
                if (object.intValue != null)
                    message.intValue = object.intValue | 0;
                if (object.uintValue != null)
                    message.uintValue = object.uintValue >>> 0;
                if (object.stringValue != null)
                    message.stringValue = String(object.stringValue);
                if (object.bytesValue != null)
                    if (typeof object.bytesValue === "string")
                        $util.base64.decode(object.bytesValue, message.bytesValue = $util.newBuffer($util.base64.length(object.bytesValue)), 0);
                    else if (object.bytesValue.length >= 0)
                        message.bytesValue = object.bytesValue;
                if (object.generation != null)
                    message.generation = object.generation >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a ResourceDelta message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.ResourceDelta
             * @static
             * @param {esp_control.v5.ResourceDelta} message ResourceDelta
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ResourceDelta.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.resourceId = 0;
                    object.generation = 0;
                }
                if (message.resourceId != null && message.hasOwnProperty("resourceId"))
                    object.resourceId = message.resourceId;
                if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                    object.boolValue = message.boolValue;
                    if (options.oneofs)
                        object.value = "boolValue";
                }
                if (message.intValue != null && message.hasOwnProperty("intValue")) {
                    object.intValue = message.intValue;
                    if (options.oneofs)
                        object.value = "intValue";
                }
                if (message.uintValue != null && message.hasOwnProperty("uintValue")) {
                    object.uintValue = message.uintValue;
                    if (options.oneofs)
                        object.value = "uintValue";
                }
                if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                    object.stringValue = message.stringValue;
                    if (options.oneofs)
                        object.value = "stringValue";
                }
                if (message.bytesValue != null && message.hasOwnProperty("bytesValue")) {
                    object.bytesValue = options.bytes === String ? $util.base64.encode(message.bytesValue, 0, message.bytesValue.length) : options.bytes === Array ? Array.prototype.slice.call(message.bytesValue) : message.bytesValue;
                    if (options.oneofs)
                        object.value = "bytesValue";
                }
                if (message.generation != null && message.hasOwnProperty("generation"))
                    object.generation = message.generation;
                return object;
            };

            /**
             * Converts this ResourceDelta to JSON.
             * @function toJSON
             * @memberof esp_control.v5.ResourceDelta
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ResourceDelta.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ResourceDelta
             * @function getTypeUrl
             * @memberof esp_control.v5.ResourceDelta
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ResourceDelta.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.ResourceDelta";
            };

            return ResourceDelta;
        })();

        v5.InvokeAction = (function() {

            /**
             * Properties of an InvokeAction.
             * @memberof esp_control.v5
             * @interface IInvokeAction
             * @property {number|null} [actionId] InvokeAction actionId
             * @property {Uint8Array|null} [payload] InvokeAction payload
             * @property {number|null} [correlationId] InvokeAction correlationId
             */

            /**
             * Constructs a new InvokeAction.
             * @memberof esp_control.v5
             * @classdesc Represents an InvokeAction.
             * @implements IInvokeAction
             * @constructor
             * @param {esp_control.v5.IInvokeAction=} [properties] Properties to set
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
             * @memberof esp_control.v5.InvokeAction
             * @instance
             */
            InvokeAction.prototype.actionId = 0;

            /**
             * InvokeAction payload.
             * @member {Uint8Array} payload
             * @memberof esp_control.v5.InvokeAction
             * @instance
             */
            InvokeAction.prototype.payload = $util.newBuffer([]);

            /**
             * InvokeAction correlationId.
             * @member {number} correlationId
             * @memberof esp_control.v5.InvokeAction
             * @instance
             */
            InvokeAction.prototype.correlationId = 0;

            /**
             * Creates a new InvokeAction instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.InvokeAction
             * @static
             * @param {esp_control.v5.IInvokeAction=} [properties] Properties to set
             * @returns {esp_control.v5.InvokeAction} InvokeAction instance
             */
            InvokeAction.create = function create(properties) {
                return new InvokeAction(properties);
            };

            /**
             * Encodes the specified InvokeAction message. Does not implicitly {@link esp_control.v5.InvokeAction.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.InvokeAction
             * @static
             * @param {esp_control.v5.IInvokeAction} message InvokeAction message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InvokeAction.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.actionId != null && Object.hasOwnProperty.call(message, "actionId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.actionId);
                if (message.payload != null && Object.hasOwnProperty.call(message, "payload"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.payload);
                if (message.correlationId != null && Object.hasOwnProperty.call(message, "correlationId"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.correlationId);
                return writer;
            };

            /**
             * Encodes the specified InvokeAction message, length delimited. Does not implicitly {@link esp_control.v5.InvokeAction.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.InvokeAction
             * @static
             * @param {esp_control.v5.IInvokeAction} message InvokeAction message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InvokeAction.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an InvokeAction message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.InvokeAction
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.InvokeAction} InvokeAction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            InvokeAction.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.InvokeAction();
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
                            message.payload = reader.bytes();
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
             * @memberof esp_control.v5.InvokeAction
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.InvokeAction} InvokeAction
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
             * @memberof esp_control.v5.InvokeAction
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
                if (message.payload != null && message.hasOwnProperty("payload"))
                    if (!(message.payload && typeof message.payload.length === "number" || $util.isString(message.payload)))
                        return "payload: buffer expected";
                if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                    if (!$util.isInteger(message.correlationId))
                        return "correlationId: integer expected";
                return null;
            };

            /**
             * Creates an InvokeAction message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof esp_control.v5.InvokeAction
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.InvokeAction} InvokeAction
             */
            InvokeAction.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.InvokeAction)
                    return object;
                let message = new $root.esp_control.v5.InvokeAction();
                if (object.actionId != null)
                    message.actionId = object.actionId >>> 0;
                if (object.payload != null)
                    if (typeof object.payload === "string")
                        $util.base64.decode(object.payload, message.payload = $util.newBuffer($util.base64.length(object.payload)), 0);
                    else if (object.payload.length >= 0)
                        message.payload = object.payload;
                if (object.correlationId != null)
                    message.correlationId = object.correlationId >>> 0;
                return message;
            };

            /**
             * Creates a plain object from an InvokeAction message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.InvokeAction
             * @static
             * @param {esp_control.v5.InvokeAction} message InvokeAction
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            InvokeAction.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.actionId = 0;
                    if (options.bytes === String)
                        object.payload = "";
                    else {
                        object.payload = [];
                        if (options.bytes !== Array)
                            object.payload = $util.newBuffer(object.payload);
                    }
                    object.correlationId = 0;
                }
                if (message.actionId != null && message.hasOwnProperty("actionId"))
                    object.actionId = message.actionId;
                if (message.payload != null && message.hasOwnProperty("payload"))
                    object.payload = options.bytes === String ? $util.base64.encode(message.payload, 0, message.payload.length) : options.bytes === Array ? Array.prototype.slice.call(message.payload) : message.payload;
                if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                    object.correlationId = message.correlationId;
                return object;
            };

            /**
             * Converts this InvokeAction to JSON.
             * @function toJSON
             * @memberof esp_control.v5.InvokeAction
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            InvokeAction.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for InvokeAction
             * @function getTypeUrl
             * @memberof esp_control.v5.InvokeAction
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            InvokeAction.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.InvokeAction";
            };

            return InvokeAction;
        })();

        v5.InvokeResult = (function() {

            /**
             * Properties of an InvokeResult.
             * @memberof esp_control.v5
             * @interface IInvokeResult
             * @property {number|null} [correlationId] InvokeResult correlationId
             * @property {esp_control.v5.Status|null} [status] InvokeResult status
             * @property {Uint8Array|null} [payload] InvokeResult payload
             * @property {string|null} [message] InvokeResult message
             */

            /**
             * Constructs a new InvokeResult.
             * @memberof esp_control.v5
             * @classdesc Represents an InvokeResult.
             * @implements IInvokeResult
             * @constructor
             * @param {esp_control.v5.IInvokeResult=} [properties] Properties to set
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
             * @memberof esp_control.v5.InvokeResult
             * @instance
             */
            InvokeResult.prototype.correlationId = 0;

            /**
             * InvokeResult status.
             * @member {esp_control.v5.Status} status
             * @memberof esp_control.v5.InvokeResult
             * @instance
             */
            InvokeResult.prototype.status = 0;

            /**
             * InvokeResult payload.
             * @member {Uint8Array} payload
             * @memberof esp_control.v5.InvokeResult
             * @instance
             */
            InvokeResult.prototype.payload = $util.newBuffer([]);

            /**
             * InvokeResult message.
             * @member {string} message
             * @memberof esp_control.v5.InvokeResult
             * @instance
             */
            InvokeResult.prototype.message = "";

            /**
             * Creates a new InvokeResult instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.InvokeResult
             * @static
             * @param {esp_control.v5.IInvokeResult=} [properties] Properties to set
             * @returns {esp_control.v5.InvokeResult} InvokeResult instance
             */
            InvokeResult.create = function create(properties) {
                return new InvokeResult(properties);
            };

            /**
             * Encodes the specified InvokeResult message. Does not implicitly {@link esp_control.v5.InvokeResult.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.InvokeResult
             * @static
             * @param {esp_control.v5.IInvokeResult} message InvokeResult message or plain object to encode
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
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.payload);
                if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.message);
                return writer;
            };

            /**
             * Encodes the specified InvokeResult message, length delimited. Does not implicitly {@link esp_control.v5.InvokeResult.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.InvokeResult
             * @static
             * @param {esp_control.v5.IInvokeResult} message InvokeResult message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InvokeResult.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an InvokeResult message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.InvokeResult
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.InvokeResult} InvokeResult
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            InvokeResult.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.InvokeResult();
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
                            message.payload = reader.bytes();
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
             * @memberof esp_control.v5.InvokeResult
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.InvokeResult} InvokeResult
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
             * @memberof esp_control.v5.InvokeResult
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
                if (message.payload != null && message.hasOwnProperty("payload"))
                    if (!(message.payload && typeof message.payload.length === "number" || $util.isString(message.payload)))
                        return "payload: buffer expected";
                if (message.message != null && message.hasOwnProperty("message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                return null;
            };

            /**
             * Creates an InvokeResult message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof esp_control.v5.InvokeResult
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.InvokeResult} InvokeResult
             */
            InvokeResult.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.InvokeResult)
                    return object;
                let message = new $root.esp_control.v5.InvokeResult();
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
                if (object.payload != null)
                    if (typeof object.payload === "string")
                        $util.base64.decode(object.payload, message.payload = $util.newBuffer($util.base64.length(object.payload)), 0);
                    else if (object.payload.length >= 0)
                        message.payload = object.payload;
                if (object.message != null)
                    message.message = String(object.message);
                return message;
            };

            /**
             * Creates a plain object from an InvokeResult message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.InvokeResult
             * @static
             * @param {esp_control.v5.InvokeResult} message InvokeResult
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
                    if (options.bytes === String)
                        object.payload = "";
                    else {
                        object.payload = [];
                        if (options.bytes !== Array)
                            object.payload = $util.newBuffer(object.payload);
                    }
                    object.message = "";
                }
                if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                    object.correlationId = message.correlationId;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.esp_control.v5.Status[message.status] === undefined ? message.status : $root.esp_control.v5.Status[message.status] : message.status;
                if (message.payload != null && message.hasOwnProperty("payload"))
                    object.payload = options.bytes === String ? $util.base64.encode(message.payload, 0, message.payload.length) : options.bytes === Array ? Array.prototype.slice.call(message.payload) : message.payload;
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                return object;
            };

            /**
             * Converts this InvokeResult to JSON.
             * @function toJSON
             * @memberof esp_control.v5.InvokeResult
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            InvokeResult.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for InvokeResult
             * @function getTypeUrl
             * @memberof esp_control.v5.InvokeResult
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            InvokeResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.InvokeResult";
            };

            return InvokeResult;
        })();

        v5.Subscribe = (function() {

            /**
             * Properties of a Subscribe.
             * @memberof esp_control.v5
             * @interface ISubscribe
             * @property {Array.<number>|null} [resourceIds] Subscribe resourceIds
             */

            /**
             * Constructs a new Subscribe.
             * @memberof esp_control.v5
             * @classdesc Represents a Subscribe.
             * @implements ISubscribe
             * @constructor
             * @param {esp_control.v5.ISubscribe=} [properties] Properties to set
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
             * @memberof esp_control.v5.Subscribe
             * @instance
             */
            Subscribe.prototype.resourceIds = $util.emptyArray;

            /**
             * Creates a new Subscribe instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.Subscribe
             * @static
             * @param {esp_control.v5.ISubscribe=} [properties] Properties to set
             * @returns {esp_control.v5.Subscribe} Subscribe instance
             */
            Subscribe.create = function create(properties) {
                return new Subscribe(properties);
            };

            /**
             * Encodes the specified Subscribe message. Does not implicitly {@link esp_control.v5.Subscribe.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.Subscribe
             * @static
             * @param {esp_control.v5.ISubscribe} message Subscribe message or plain object to encode
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
             * Encodes the specified Subscribe message, length delimited. Does not implicitly {@link esp_control.v5.Subscribe.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.Subscribe
             * @static
             * @param {esp_control.v5.ISubscribe} message Subscribe message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Subscribe.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Subscribe message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.Subscribe
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.Subscribe} Subscribe
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Subscribe.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.Subscribe();
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
             * @memberof esp_control.v5.Subscribe
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.Subscribe} Subscribe
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
             * @memberof esp_control.v5.Subscribe
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
             * @memberof esp_control.v5.Subscribe
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.Subscribe} Subscribe
             */
            Subscribe.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.Subscribe)
                    return object;
                let message = new $root.esp_control.v5.Subscribe();
                if (object.resourceIds) {
                    if (!Array.isArray(object.resourceIds))
                        throw TypeError(".esp_control.v5.Subscribe.resourceIds: array expected");
                    message.resourceIds = [];
                    for (let i = 0; i < object.resourceIds.length; ++i)
                        message.resourceIds[i] = object.resourceIds[i] >>> 0;
                }
                return message;
            };

            /**
             * Creates a plain object from a Subscribe message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.Subscribe
             * @static
             * @param {esp_control.v5.Subscribe} message Subscribe
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
             * @memberof esp_control.v5.Subscribe
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Subscribe.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Subscribe
             * @function getTypeUrl
             * @memberof esp_control.v5.Subscribe
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Subscribe.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.Subscribe";
            };

            return Subscribe;
        })();

        v5.Unsubscribe = (function() {

            /**
             * Properties of an Unsubscribe.
             * @memberof esp_control.v5
             * @interface IUnsubscribe
             * @property {Array.<number>|null} [resourceIds] Unsubscribe resourceIds
             */

            /**
             * Constructs a new Unsubscribe.
             * @memberof esp_control.v5
             * @classdesc Represents an Unsubscribe.
             * @implements IUnsubscribe
             * @constructor
             * @param {esp_control.v5.IUnsubscribe=} [properties] Properties to set
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
             * @memberof esp_control.v5.Unsubscribe
             * @instance
             */
            Unsubscribe.prototype.resourceIds = $util.emptyArray;

            /**
             * Creates a new Unsubscribe instance using the specified properties.
             * @function create
             * @memberof esp_control.v5.Unsubscribe
             * @static
             * @param {esp_control.v5.IUnsubscribe=} [properties] Properties to set
             * @returns {esp_control.v5.Unsubscribe} Unsubscribe instance
             */
            Unsubscribe.create = function create(properties) {
                return new Unsubscribe(properties);
            };

            /**
             * Encodes the specified Unsubscribe message. Does not implicitly {@link esp_control.v5.Unsubscribe.verify|verify} messages.
             * @function encode
             * @memberof esp_control.v5.Unsubscribe
             * @static
             * @param {esp_control.v5.IUnsubscribe} message Unsubscribe message or plain object to encode
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
             * Encodes the specified Unsubscribe message, length delimited. Does not implicitly {@link esp_control.v5.Unsubscribe.verify|verify} messages.
             * @function encodeDelimited
             * @memberof esp_control.v5.Unsubscribe
             * @static
             * @param {esp_control.v5.IUnsubscribe} message Unsubscribe message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Unsubscribe.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Unsubscribe message from the specified reader or buffer.
             * @function decode
             * @memberof esp_control.v5.Unsubscribe
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {esp_control.v5.Unsubscribe} Unsubscribe
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Unsubscribe.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.esp_control.v5.Unsubscribe();
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
             * @memberof esp_control.v5.Unsubscribe
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {esp_control.v5.Unsubscribe} Unsubscribe
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
             * @memberof esp_control.v5.Unsubscribe
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
             * @memberof esp_control.v5.Unsubscribe
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {esp_control.v5.Unsubscribe} Unsubscribe
             */
            Unsubscribe.fromObject = function fromObject(object) {
                if (object instanceof $root.esp_control.v5.Unsubscribe)
                    return object;
                let message = new $root.esp_control.v5.Unsubscribe();
                if (object.resourceIds) {
                    if (!Array.isArray(object.resourceIds))
                        throw TypeError(".esp_control.v5.Unsubscribe.resourceIds: array expected");
                    message.resourceIds = [];
                    for (let i = 0; i < object.resourceIds.length; ++i)
                        message.resourceIds[i] = object.resourceIds[i] >>> 0;
                }
                return message;
            };

            /**
             * Creates a plain object from an Unsubscribe message. Also converts values to other types if specified.
             * @function toObject
             * @memberof esp_control.v5.Unsubscribe
             * @static
             * @param {esp_control.v5.Unsubscribe} message Unsubscribe
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
             * @memberof esp_control.v5.Unsubscribe
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Unsubscribe.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Unsubscribe
             * @function getTypeUrl
             * @memberof esp_control.v5.Unsubscribe
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Unsubscribe.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/esp_control.v5.Unsubscribe";
            };

            return Unsubscribe;
        })();

        return v5;
    })();

    return esp_control;
})();

export { $root as default };
