import { Callout, DirectionalHint, TooltipHost } from "@fluentui/react";
import { memo, useState } from "react";
import styled from "styled-components";
import produce from "immer";
import { useId } from "@fluentui/react-hooks";
import { IToolbarItem, IToolbarProps, ToolbarItemContainer } from "./toolbar-item";
import { ToolbarContainer, useHandlers, ToolbarItemContainerElement } from "./components";


const OptionGroup = styled(ToolbarContainer)`
    flex-direction: column;
    width: max-content;
    height: max-content;
    --aside: 8px;
`;

const Option = styled(ToolbarItemContainerElement)`
    width: unset;
    height: var(--height);
    position: relative;
    font-size: 95%;
    padding-left: var(--aside);
    padding-right: 0.4em;
    align-items: center;
    &[aria-selected="true"] {
        ::before {
            display: block;
            position: absolute;
            content: "";
            left: calc(var(--aside) / 2);
            width: calc(var(--aside) / 2);
            top: calc(var(--height) / 8);
            bottom: calc(var(--height) / 8);
            background-color: #3064df;
        }
    }
    > label {
        user-select: none;
        pointer-events: none;
    }
`;

export interface ToolbarSelectButtonItem<T extends string = string> extends IToolbarItem {
    options: {
        key: T;
        icon: (props: React.SVGProps<SVGSVGElement> & {
            title?: string | undefined;
            titleId?: string | undefined;
        }) => JSX.Element;
        label: string;
        /** @default false */
        disabled?: boolean;
    }[];
    value: T;
    onSelect: (value: T) => void;
}

const ToolbarSelectButton = memo<IToolbarProps<ToolbarSelectButtonItem>>(function ToolbarSelectButton(props) {
    const id = useId();
    const { item, styles } = props;
    const { icon: Icon, label, disabled, options, value, onSelect } = item;
    
    const [opened, setOpened] = useState(false);
    const handlers = useHandlers(() => setOpened(!opened), disabled ?? false);

    const currentOption = options.find(opt => opt.key === value);
    const CurrentIcon = currentOption?.icon;

    return (
        <TooltipHost content={label} styles={{ root: { display: 'inline-flex', position: 'relative' } }}>
            <ToolbarItemContainer
                props={produce(props, draft => {
                    if (currentOption) {
                        draft.item.label = `${draft.item.label}: ${currentOption.label}`;
                    }
                    draft.item.menu = undefined;
                })}
                handlers={handlers}
                aria-haspopup="listbox"
                id={id}
            >
                <Icon style={styles?.icon} />
                {CurrentIcon && (
                    <CurrentIcon
                        style={{
                            ...styles?.icon,
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            width: '40%',
                            height: '40%',
                            margin: 'calc((var(--height) - var(--icon-size)) * 0.2)',
                            filter: 'drop-shadow(0 0 0.5px var(--background-color)) '.repeat(4),
                            pointerEvents: 'none',
                            color: '#3b72f3',
                        }}
                    />
                )}
            </ToolbarItemContainer>
            {opened && (
                <Callout target={`#${id}`} role="dialog" gapSpace={0} directionalHint={DirectionalHint.bottomCenter} beakWidth={8} styles={{ calloutMain: { background: 'unset' }, beakCurtain: { background: 'unset' }, beak: { backgroundColor: '#121212' } }}>
                    <OptionGroup role="listbox" aria-activedescendant={`${id}::${value}`} aria-describedby={id} aria-disabled={disabled}>
                        {options.map((option, idx, arr) => {
                            const selected = option.key === value;
                            const OptionIcon = option.icon;
                            const optionId = `${id}::${value}`;
                            const prev = arr[(idx + arr.length - 1) % arr.length];
                            const next = arr[(idx + 1) % arr.length];
                            return (
                                <Option
                                    key={option.key}
                                    id={optionId}
                                    role="option"
                                    aria-disabled={option.disabled ?? false}
                                    aria-selected={selected}
                                    split={false}
                                    tabIndex={0}
                                    onFocus={() => onSelect(option.key)}
                                    onClick={() => {
                                        onSelect(option.key);
                                        setOpened(false);
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'ArrowDown') {
                                            onSelect(next.key);
                                        } else if (e.key === 'ArrowUp') {
                                            onSelect(prev.key);
                                        }
                                    }}
                                    ref={e => {
                                        if (e && selected) {
                                            e.focus();
                                        }
                                    }}
                                >
                                    <OptionIcon style={styles?.icon} />
                                    <label>{option.label}</label>
                                </Option>
                            );
                        })}
                    </OptionGroup>
                </Callout>
            )}
        </TooltipHost>
    );
});


export default ToolbarSelectButton;
