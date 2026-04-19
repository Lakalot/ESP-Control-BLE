import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace esp_control. */
export namespace esp_control {

    /** Namespace v5. */
    namespace v5 {

        /** ValueType enum. */
        enum ValueType {
            VALUE_TYPE_UNSPECIFIED = 0,
            VALUE_TYPE_BOOL = 1,
            VALUE_TYPE_INT = 2,
            VALUE_TYPE_UINT = 3,
            VALUE_TYPE_FLOAT = 4,
            VALUE_TYPE_STRING = 5,
            VALUE_TYPE_ENUM = 6,
            VALUE_TYPE_DURATION_MS = 7
        }

        /** ReadMode enum. */
        enum ReadMode {
            READ_MODE_UNSPECIFIED = 0,
            READ_MODE_SNAPSHOT = 1,
            READ_MODE_SUBSCRIBE = 2,
            READ_MODE_POLL = 3
        }

        /** DangerLevel enum. */
        enum DangerLevel {
            DANGER_LEVEL_UNSPECIFIED = 0,
            DANGER_LEVEL_NORMAL = 1,
            DANGER_LEVEL_ELEVATED = 2,
            DANGER_LEVEL_DANGEROUS = 3
        }

        /** NodeKind enum. */
        enum NodeKind {
            NODE_KIND_UNSPECIFIED = 0,
            NODE_KIND_STACK = 1,
            NODE_KIND_ROW = 2,
            NODE_KIND_GRID = 3,
            NODE_KIND_SECTION = 4,
            NODE_KIND_WIDGET = 5
        }

        /** WidgetKind enum. */
        enum WidgetKind {
            WIDGET_KIND_UNSPECIFIED = 0,
            WIDGET_KIND_ACTION = 1,
            WIDGET_KIND_TOGGLE = 2,
            WIDGET_KIND_RANGE = 3,
            WIDGET_KIND_SELECT = 4,
            WIDGET_KIND_READ_ONLY = 5,
            WIDGET_KIND_TEXT = 6,
            WIDGET_KIND_DIVIDER = 7
        }

        /** Properties of a StringEntry. */
        interface IStringEntry {

            /** StringEntry value */
            value?: (string|null);
        }

        /** Represents a StringEntry. */
        class StringEntry implements IStringEntry {

            /**
             * Constructs a new StringEntry.
             * @param [properties] Properties to set
             */
            constructor(properties?: esp_control.v5.IStringEntry);

            /** StringEntry value. */
            public value: string;

            /**
             * Creates a new StringEntry instance using the specified properties.
             * @param [properties] Properties to set
             * @returns StringEntry instance
             */
            public static create(properties?: esp_control.v5.IStringEntry): esp_control.v5.StringEntry;

            /**
             * Encodes the specified StringEntry message. Does not implicitly {@link esp_control.v5.StringEntry.verify|verify} messages.
             * @param message StringEntry message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: esp_control.v5.IStringEntry, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified StringEntry message, length delimited. Does not implicitly {@link esp_control.v5.StringEntry.verify|verify} messages.
             * @param message StringEntry message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: esp_control.v5.IStringEntry, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a StringEntry message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns StringEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.v5.StringEntry;

            /**
             * Decodes a StringEntry message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns StringEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.v5.StringEntry;

            /**
             * Verifies a StringEntry message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a StringEntry message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns StringEntry
             */
            public static fromObject(object: { [k: string]: any }): esp_control.v5.StringEntry;

            /**
             * Creates a plain object from a StringEntry message. Also converts values to other types if specified.
             * @param message StringEntry
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: esp_control.v5.StringEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this StringEntry to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for StringEntry
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Rule. */
        interface IRule {

            /** Rule jsonlogic */
            jsonlogic?: (string|null);
        }

        /** Represents a Rule. */
        class Rule implements IRule {

            /**
             * Constructs a new Rule.
             * @param [properties] Properties to set
             */
            constructor(properties?: esp_control.v5.IRule);

            /** Rule jsonlogic. */
            public jsonlogic: string;

            /**
             * Creates a new Rule instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Rule instance
             */
            public static create(properties?: esp_control.v5.IRule): esp_control.v5.Rule;

            /**
             * Encodes the specified Rule message. Does not implicitly {@link esp_control.v5.Rule.verify|verify} messages.
             * @param message Rule message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: esp_control.v5.IRule, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Rule message, length delimited. Does not implicitly {@link esp_control.v5.Rule.verify|verify} messages.
             * @param message Rule message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: esp_control.v5.IRule, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Rule message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Rule
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.v5.Rule;

            /**
             * Decodes a Rule message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Rule
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.v5.Rule;

            /**
             * Verifies a Rule message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Rule message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Rule
             */
            public static fromObject(object: { [k: string]: any }): esp_control.v5.Rule;

            /**
             * Creates a plain object from a Rule message. Also converts values to other types if specified.
             * @param message Rule
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: esp_control.v5.Rule, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Rule to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Rule
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CapabilitiesDef. */
        interface ICapabilitiesDef {

            /** CapabilitiesDef featureIdxs */
            featureIdxs?: (number[]|null);
        }

        /** Represents a CapabilitiesDef. */
        class CapabilitiesDef implements ICapabilitiesDef {

            /**
             * Constructs a new CapabilitiesDef.
             * @param [properties] Properties to set
             */
            constructor(properties?: esp_control.v5.ICapabilitiesDef);

            /** CapabilitiesDef featureIdxs. */
            public featureIdxs: number[];

            /**
             * Creates a new CapabilitiesDef instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CapabilitiesDef instance
             */
            public static create(properties?: esp_control.v5.ICapabilitiesDef): esp_control.v5.CapabilitiesDef;

            /**
             * Encodes the specified CapabilitiesDef message. Does not implicitly {@link esp_control.v5.CapabilitiesDef.verify|verify} messages.
             * @param message CapabilitiesDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: esp_control.v5.ICapabilitiesDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CapabilitiesDef message, length delimited. Does not implicitly {@link esp_control.v5.CapabilitiesDef.verify|verify} messages.
             * @param message CapabilitiesDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: esp_control.v5.ICapabilitiesDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CapabilitiesDef message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CapabilitiesDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.v5.CapabilitiesDef;

            /**
             * Decodes a CapabilitiesDef message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CapabilitiesDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.v5.CapabilitiesDef;

            /**
             * Verifies a CapabilitiesDef message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CapabilitiesDef message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CapabilitiesDef
             */
            public static fromObject(object: { [k: string]: any }): esp_control.v5.CapabilitiesDef;

            /**
             * Creates a plain object from a CapabilitiesDef message. Also converts values to other types if specified.
             * @param message CapabilitiesDef
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: esp_control.v5.CapabilitiesDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CapabilitiesDef to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CapabilitiesDef
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ResourceDef. */
        interface IResourceDef {

            /** ResourceDef id */
            id?: (number|null);

            /** ResourceDef slugIdx */
            slugIdx?: (number|null);

            /** ResourceDef labelIdx */
            labelIdx?: (number|null);

            /** ResourceDef unitIdx */
            unitIdx?: (number|null);

            /** ResourceDef valueType */
            valueType?: (esp_control.v5.ValueType|null);

            /** ResourceDef readMode */
            readMode?: (esp_control.v5.ReadMode|null);

            /** ResourceDef staleAfterMs */
            staleAfterMs?: (number|null);

            /** ResourceDef pollMs */
            pollMs?: (number|null);

            /** ResourceDef enumValueIdxs */
            enumValueIdxs?: (number[]|null);
        }

        /** Represents a ResourceDef. */
        class ResourceDef implements IResourceDef {

            /**
             * Constructs a new ResourceDef.
             * @param [properties] Properties to set
             */
            constructor(properties?: esp_control.v5.IResourceDef);

            /** ResourceDef id. */
            public id: number;

            /** ResourceDef slugIdx. */
            public slugIdx: number;

            /** ResourceDef labelIdx. */
            public labelIdx: number;

            /** ResourceDef unitIdx. */
            public unitIdx: number;

            /** ResourceDef valueType. */
            public valueType: esp_control.v5.ValueType;

            /** ResourceDef readMode. */
            public readMode: esp_control.v5.ReadMode;

            /** ResourceDef staleAfterMs. */
            public staleAfterMs: number;

            /** ResourceDef pollMs. */
            public pollMs: number;

            /** ResourceDef enumValueIdxs. */
            public enumValueIdxs: number[];

            /**
             * Creates a new ResourceDef instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ResourceDef instance
             */
            public static create(properties?: esp_control.v5.IResourceDef): esp_control.v5.ResourceDef;

            /**
             * Encodes the specified ResourceDef message. Does not implicitly {@link esp_control.v5.ResourceDef.verify|verify} messages.
             * @param message ResourceDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: esp_control.v5.IResourceDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ResourceDef message, length delimited. Does not implicitly {@link esp_control.v5.ResourceDef.verify|verify} messages.
             * @param message ResourceDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: esp_control.v5.IResourceDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ResourceDef message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ResourceDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.v5.ResourceDef;

            /**
             * Decodes a ResourceDef message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ResourceDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.v5.ResourceDef;

            /**
             * Verifies a ResourceDef message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ResourceDef message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ResourceDef
             */
            public static fromObject(object: { [k: string]: any }): esp_control.v5.ResourceDef;

            /**
             * Creates a plain object from a ResourceDef message. Also converts values to other types if specified.
             * @param message ResourceDef
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: esp_control.v5.ResourceDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ResourceDef to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ResourceDef
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an ActionDef. */
        interface IActionDef {

            /** ActionDef id */
            id?: (number|null);

            /** ActionDef slugIdx */
            slugIdx?: (number|null);

            /** ActionDef labelIdx */
            labelIdx?: (number|null);

            /** ActionDef dangerLevel */
            dangerLevel?: (esp_control.v5.DangerLevel|null);

            /** ActionDef confirmIdx */
            confirmIdx?: (number|null);

            /** ActionDef cooldownMs */
            cooldownMs?: (number|null);

            /** ActionDef inputSchemaIdx */
            inputSchemaIdx?: (number|null);

            /** ActionDef resultSchemaIdx */
            resultSchemaIdx?: (number|null);
        }

        /** Represents an ActionDef. */
        class ActionDef implements IActionDef {

            /**
             * Constructs a new ActionDef.
             * @param [properties] Properties to set
             */
            constructor(properties?: esp_control.v5.IActionDef);

            /** ActionDef id. */
            public id: number;

            /** ActionDef slugIdx. */
            public slugIdx: number;

            /** ActionDef labelIdx. */
            public labelIdx: number;

            /** ActionDef dangerLevel. */
            public dangerLevel: esp_control.v5.DangerLevel;

            /** ActionDef confirmIdx. */
            public confirmIdx: number;

            /** ActionDef cooldownMs. */
            public cooldownMs: number;

            /** ActionDef inputSchemaIdx. */
            public inputSchemaIdx: number;

            /** ActionDef resultSchemaIdx. */
            public resultSchemaIdx: number;

            /**
             * Creates a new ActionDef instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ActionDef instance
             */
            public static create(properties?: esp_control.v5.IActionDef): esp_control.v5.ActionDef;

            /**
             * Encodes the specified ActionDef message. Does not implicitly {@link esp_control.v5.ActionDef.verify|verify} messages.
             * @param message ActionDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: esp_control.v5.IActionDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ActionDef message, length delimited. Does not implicitly {@link esp_control.v5.ActionDef.verify|verify} messages.
             * @param message ActionDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: esp_control.v5.IActionDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ActionDef message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ActionDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.v5.ActionDef;

            /**
             * Decodes an ActionDef message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ActionDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.v5.ActionDef;

            /**
             * Verifies an ActionDef message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ActionDef message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ActionDef
             */
            public static fromObject(object: { [k: string]: any }): esp_control.v5.ActionDef;

            /**
             * Creates a plain object from an ActionDef message. Also converts values to other types if specified.
             * @param message ActionDef
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: esp_control.v5.ActionDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ActionDef to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ActionDef
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ScreenDef. */
        interface IScreenDef {

            /** ScreenDef id */
            id?: (number|null);

            /** ScreenDef slugIdx */
            slugIdx?: (number|null);

            /** ScreenDef titleIdx */
            titleIdx?: (number|null);

            /** ScreenDef routeKeyIdx */
            routeKeyIdx?: (number|null);

            /** ScreenDef rootNodeId */
            rootNodeId?: (number|null);

            /** ScreenDef entryRules */
            entryRules?: (esp_control.v5.IRule[]|null);
        }

        /** Represents a ScreenDef. */
        class ScreenDef implements IScreenDef {

            /**
             * Constructs a new ScreenDef.
             * @param [properties] Properties to set
             */
            constructor(properties?: esp_control.v5.IScreenDef);

            /** ScreenDef id. */
            public id: number;

            /** ScreenDef slugIdx. */
            public slugIdx: number;

            /** ScreenDef titleIdx. */
            public titleIdx: number;

            /** ScreenDef routeKeyIdx. */
            public routeKeyIdx: number;

            /** ScreenDef rootNodeId. */
            public rootNodeId: number;

            /** ScreenDef entryRules. */
            public entryRules: esp_control.v5.IRule[];

            /**
             * Creates a new ScreenDef instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ScreenDef instance
             */
            public static create(properties?: esp_control.v5.IScreenDef): esp_control.v5.ScreenDef;

            /**
             * Encodes the specified ScreenDef message. Does not implicitly {@link esp_control.v5.ScreenDef.verify|verify} messages.
             * @param message ScreenDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: esp_control.v5.IScreenDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ScreenDef message, length delimited. Does not implicitly {@link esp_control.v5.ScreenDef.verify|verify} messages.
             * @param message ScreenDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: esp_control.v5.IScreenDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ScreenDef message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ScreenDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.v5.ScreenDef;

            /**
             * Decodes a ScreenDef message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ScreenDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.v5.ScreenDef;

            /**
             * Verifies a ScreenDef message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ScreenDef message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ScreenDef
             */
            public static fromObject(object: { [k: string]: any }): esp_control.v5.ScreenDef;

            /**
             * Creates a plain object from a ScreenDef message. Also converts values to other types if specified.
             * @param message ScreenDef
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: esp_control.v5.ScreenDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ScreenDef to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ScreenDef
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a BindingDef. */
        interface IBindingDef {

            /** BindingDef resourceId */
            resourceId?: (number|null);

            /** BindingDef actionId */
            actionId?: (number|null);
        }

        /** Represents a BindingDef. */
        class BindingDef implements IBindingDef {

            /**
             * Constructs a new BindingDef.
             * @param [properties] Properties to set
             */
            constructor(properties?: esp_control.v5.IBindingDef);

            /** BindingDef resourceId. */
            public resourceId: number;

            /** BindingDef actionId. */
            public actionId: number;

            /**
             * Creates a new BindingDef instance using the specified properties.
             * @param [properties] Properties to set
             * @returns BindingDef instance
             */
            public static create(properties?: esp_control.v5.IBindingDef): esp_control.v5.BindingDef;

            /**
             * Encodes the specified BindingDef message. Does not implicitly {@link esp_control.v5.BindingDef.verify|verify} messages.
             * @param message BindingDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: esp_control.v5.IBindingDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified BindingDef message, length delimited. Does not implicitly {@link esp_control.v5.BindingDef.verify|verify} messages.
             * @param message BindingDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: esp_control.v5.IBindingDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a BindingDef message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns BindingDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.v5.BindingDef;

            /**
             * Decodes a BindingDef message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns BindingDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.v5.BindingDef;

            /**
             * Verifies a BindingDef message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a BindingDef message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns BindingDef
             */
            public static fromObject(object: { [k: string]: any }): esp_control.v5.BindingDef;

            /**
             * Creates a plain object from a BindingDef message. Also converts values to other types if specified.
             * @param message BindingDef
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: esp_control.v5.BindingDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this BindingDef to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for BindingDef
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a NodeDef. */
        interface INodeDef {

            /** NodeDef id */
            id?: (number|null);

            /** NodeDef slugIdx */
            slugIdx?: (number|null);

            /** NodeDef kind */
            kind?: (esp_control.v5.NodeKind|null);

            /** NodeDef widgetKind */
            widgetKind?: (esp_control.v5.WidgetKind|null);

            /** NodeDef titleIdx */
            titleIdx?: (number|null);

            /** NodeDef toneIdx */
            toneIdx?: (number|null);

            /** NodeDef childrenIds */
            childrenIds?: (number[]|null);

            /** NodeDef columns */
            columns?: (number|null);

            /** NodeDef bind */
            bind?: (esp_control.v5.IBindingDef|null);

            /** NodeDef visibleIf */
            visibleIf?: (esp_control.v5.IRule|null);

            /** NodeDef enabledIf */
            enabledIf?: (esp_control.v5.IRule|null);

            /** NodeDef textIdx */
            textIdx?: (number|null);

            /** NodeDef formatHintIdx */
            formatHintIdx?: (number|null);
        }

        /** Represents a NodeDef. */
        class NodeDef implements INodeDef {

            /**
             * Constructs a new NodeDef.
             * @param [properties] Properties to set
             */
            constructor(properties?: esp_control.v5.INodeDef);

            /** NodeDef id. */
            public id: number;

            /** NodeDef slugIdx. */
            public slugIdx: number;

            /** NodeDef kind. */
            public kind: esp_control.v5.NodeKind;

            /** NodeDef widgetKind. */
            public widgetKind: esp_control.v5.WidgetKind;

            /** NodeDef titleIdx. */
            public titleIdx: number;

            /** NodeDef toneIdx. */
            public toneIdx: number;

            /** NodeDef childrenIds. */
            public childrenIds: number[];

            /** NodeDef columns. */
            public columns: number;

            /** NodeDef bind. */
            public bind?: (esp_control.v5.IBindingDef|null);

            /** NodeDef visibleIf. */
            public visibleIf?: (esp_control.v5.IRule|null);

            /** NodeDef enabledIf. */
            public enabledIf?: (esp_control.v5.IRule|null);

            /** NodeDef textIdx. */
            public textIdx: number;

            /** NodeDef formatHintIdx. */
            public formatHintIdx: number;

            /**
             * Creates a new NodeDef instance using the specified properties.
             * @param [properties] Properties to set
             * @returns NodeDef instance
             */
            public static create(properties?: esp_control.v5.INodeDef): esp_control.v5.NodeDef;

            /**
             * Encodes the specified NodeDef message. Does not implicitly {@link esp_control.v5.NodeDef.verify|verify} messages.
             * @param message NodeDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: esp_control.v5.INodeDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified NodeDef message, length delimited. Does not implicitly {@link esp_control.v5.NodeDef.verify|verify} messages.
             * @param message NodeDef message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: esp_control.v5.INodeDef, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a NodeDef message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns NodeDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.v5.NodeDef;

            /**
             * Decodes a NodeDef message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns NodeDef
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.v5.NodeDef;

            /**
             * Verifies a NodeDef message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a NodeDef message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns NodeDef
             */
            public static fromObject(object: { [k: string]: any }): esp_control.v5.NodeDef;

            /**
             * Creates a plain object from a NodeDef message. Also converts values to other types if specified.
             * @param message NodeDef
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: esp_control.v5.NodeDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this NodeDef to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for NodeDef
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ManifestBundleV5. */
        interface IManifestBundleV5 {

            /** ManifestBundleV5 version */
            version?: (number|null);

            /** ManifestBundleV5 capabilities */
            capabilities?: (esp_control.v5.ICapabilitiesDef|null);

            /** ManifestBundleV5 strings */
            strings?: (esp_control.v5.IStringEntry[]|null);

            /** ManifestBundleV5 resources */
            resources?: (esp_control.v5.IResourceDef[]|null);

            /** ManifestBundleV5 actions */
            actions?: (esp_control.v5.IActionDef[]|null);

            /** ManifestBundleV5 screens */
            screens?: (esp_control.v5.IScreenDef[]|null);

            /** ManifestBundleV5 nodes */
            nodes?: (esp_control.v5.INodeDef[]|null);
        }

        /** Represents a ManifestBundleV5. */
        class ManifestBundleV5 implements IManifestBundleV5 {

            /**
             * Constructs a new ManifestBundleV5.
             * @param [properties] Properties to set
             */
            constructor(properties?: esp_control.v5.IManifestBundleV5);

            /** ManifestBundleV5 version. */
            public version: number;

            /** ManifestBundleV5 capabilities. */
            public capabilities?: (esp_control.v5.ICapabilitiesDef|null);

            /** ManifestBundleV5 strings. */
            public strings: esp_control.v5.IStringEntry[];

            /** ManifestBundleV5 resources. */
            public resources: esp_control.v5.IResourceDef[];

            /** ManifestBundleV5 actions. */
            public actions: esp_control.v5.IActionDef[];

            /** ManifestBundleV5 screens. */
            public screens: esp_control.v5.IScreenDef[];

            /** ManifestBundleV5 nodes. */
            public nodes: esp_control.v5.INodeDef[];

            /**
             * Creates a new ManifestBundleV5 instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ManifestBundleV5 instance
             */
            public static create(properties?: esp_control.v5.IManifestBundleV5): esp_control.v5.ManifestBundleV5;

            /**
             * Encodes the specified ManifestBundleV5 message. Does not implicitly {@link esp_control.v5.ManifestBundleV5.verify|verify} messages.
             * @param message ManifestBundleV5 message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: esp_control.v5.IManifestBundleV5, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ManifestBundleV5 message, length delimited. Does not implicitly {@link esp_control.v5.ManifestBundleV5.verify|verify} messages.
             * @param message ManifestBundleV5 message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: esp_control.v5.IManifestBundleV5, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ManifestBundleV5 message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ManifestBundleV5
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.v5.ManifestBundleV5;

            /**
             * Decodes a ManifestBundleV5 message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ManifestBundleV5
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.v5.ManifestBundleV5;

            /**
             * Verifies a ManifestBundleV5 message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ManifestBundleV5 message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ManifestBundleV5
             */
            public static fromObject(object: { [k: string]: any }): esp_control.v5.ManifestBundleV5;

            /**
             * Creates a plain object from a ManifestBundleV5 message. Also converts values to other types if specified.
             * @param message ManifestBundleV5
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: esp_control.v5.ManifestBundleV5, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ManifestBundleV5 to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ManifestBundleV5
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
