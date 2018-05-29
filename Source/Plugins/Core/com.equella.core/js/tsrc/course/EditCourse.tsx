import { Button, FormControl, FormControlLabel, FormGroup, FormHelperText, Grid, IconButton, Input, InputLabel, MenuItem, Paper, Snackbar, Switch, Tab, Tabs, TextField, Theme } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import { StyleRules, WithStyles, withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
//import SwipeableViews from 'react-swipeable-views';
import { DatePicker } from 'material-ui-pickers';
import * as React from 'react';
import { Dispatch, connect } from 'react-redux';
import courseService from '.';
import aclService from '../acl/index';
import { Course } from '../api';
import { AclEditorChangeEvent, TargetListEntry } from '../api/acleditor';
import { Error, Loader } from '../components/index';
import { EditEntityDispatchProps, EditEntityProps, EditEntityStateProps, entityStrings } from '../entity';
import schemaService from '../schema/index';
import { StoreState } from '../store';
import { commonString } from '../util/commonstrings';
import { formatISO, parseISO } from '../util/dates';
import { properties } from '../util/dictionary';
import { prepLangStrings } from '../util/langstrings';

const styles = (theme: Theme) => {
    //TODO: get drawerWidth passed in somehow
    const footerHeight = 48;
    return {
        form: {
            display: 'flex',
            flexFlow: 'row wrap',
        },
        formControl: {
            margin: theme.spacing.unit,
            flex: '1 1 40%',
            marginBottom: 2 * theme.spacing.unit
        },
        formControl2: {
            margin: theme.spacing.unit,
            flex: '2 1 100%',
            marginBottom: 2 * theme.spacing.unit
        },
        body: {
            height: `calc(100% - ${footerHeight}px)`,
            paddingBottom: '24px'
        },
        footer: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: "100%",
            height: `${footerHeight}px`
        },
        footerActions: {
            float: 'right',
            padding: '4px',
            paddingRight: '20px'
        }, 
        hiddenTab: {
            display: "none"
        }
    } as StyleRules;
};

interface EditCourseStateProps extends EditEntityStateProps<Course> {
    citations?: string[];
    availablePrivileges?: string[];
}

interface EditCourseDispatchProps extends EditEntityDispatchProps<Course> {
    loadCitations: () => Promise<string[]>;
    listPrivileges: (node: string) => Promise<{node: string, result: string[]}>;
}

interface EditCourseProps extends EditEntityProps<Course>, EditCourseStateProps, EditCourseDispatchProps {
}

type Props = EditCourseProps & 
    WithStyles<'hiddenTab' | 'body' | 'formControl' | 'formControl2' | 'form' | 'footerActions' | 'footer'>;

interface EditCourseState {
    activeTab?: number;
    canSave: boolean;
    changed: boolean;
    justSaved: boolean;
    editSecurity?: () => TargetListEntry[];
}
export const strings = prepLangStrings("courseedit",
    {
        title: "Edit Course",
        tab: "Course Details",
        name: {
            label: "Name",
            help: "Course name, e.g. Advanced EQUELLA studies"
        }, 
        description:
        {
            label: "Description",
            help: "A brief description"
        }, 
        code: {
            label: "Code",
            help: "Course code, e.g. EQ101"
        }, 
        type: {
            label: "Course Type",
            i: "Internal" ,
            e: "External",
            s: "Staff"
        }, 
        department: {
            label: "Department Name"
        }, 
        citation: {
            label: "Citation"
        }, 
        startdate: {
            label: "Start Date" 
        }, 
        enddate: {
            label: "End Date"
        }, 
        version: {
            label: "Version Selection",
            default: "Default",
            forcelatest: "Force selection to be the resource version the user is viewing",
            forcecurrent: "Force selection to always be the latest live resource version",
            defaultlatest: "User can choose, but default to be the resource version the user is viewing",
            defaultcurrent: "User can choose, but default to be the latest live resource version",
            help: "When accessing EQUELLA via this course in an external system, all resources added to the external system will use this version selection strategy"
        },
        students: {
            label: "Unique Individuals"
        }, 
        archived: {
            label: "Archived"
        },
        saved: "Successfully saved"
    }
);


class EditCourse extends React.Component<Props, EditCourseState> {

    constructor(props: Props){
        super(props);

        this.state = {
            activeTab: 0,
            canSave: true,
            changed: false, 
            justSaved: false
        };
        if (this.props.uuid)
        {
            this.props.loadEntity(this.props.uuid);
        }
        else 
        {
            this.props.modifyEntity({
                code: '',
                name: '', 
                description: '', 
                type: 'Internal'
            });
        }
        this.props.loadCitations();
        this.props.listPrivileges('COURSE_INFO');
    }

    modifyEntity = (c: Partial<Course>) => {
        if (this.props.entity)
        {
            this.props.modifyEntity({...this.props.entity, ...c});
            this.setState({changed:true});
        }
    }

    handleSave() {
        if (this.props.entity)
        {
            const { versionSelection } = this.props.entity;
            const vs = (versionSelection === "DEFAULT" ? undefined : versionSelection);
            
            let course = {
                ...this.props.entity,
                versionSelection: vs,
                security: this.state.editSecurity ? {rules: this.state.editSecurity()} : this.props.entity.security
            };
            
            const { saveEntity } = this.props;
            const thiss = this;
            this.props.validateEntity(course).then(function(valErrors){
                if (properties(valErrors).length === 0){
                    saveEntity(course).then(_ => thiss.setState({changed:false, justSaved: true}));
                }
            });
        }
    }

    handleChange(stateFieldName: string): (event: React.ChangeEvent<any>) => void {
        return (event: React.ChangeEvent<any>) => {
            this.modifyEntity({ [stateFieldName]: event.target.value });            
        };
    }

    handleCheckboxChange(stateFieldName: string): (event: React.ChangeEvent<any>) => void {
        return (event: React.ChangeEvent<any>) => {
            this.modifyEntity({ [stateFieldName]: event.target.checked });
        };
    }

    handleDateChange(stateFieldName: string): (date?: Date) => void {
        return (date?: Date) => {
            this.modifyEntity({ [stateFieldName]: date ? formatISO(date) : null});
        };
    }

    handleTabChange(): (event: any, value: number) => void {
        return (event: any, value: number) => {
            this.setState({ activeTab: value });
        };
    }

    handleChangeTabIndex(): (index: number) => void {
        return (index: number) => {
            this.setState({ activeTab: index });
        };
    }

    handleAclChange(): (e: AclEditorChangeEvent) => void {
        return (e: AclEditorChangeEvent) => {
            this.setState({ canSave: e.canSave, changed: true, editSecurity: e.getAcls });
        }
    }

    hideSnack = () => {
        this.setState({justSaved:false})
    }

    render() {
        const { loading, entity, citations, availablePrivileges, classes } = this.props;
        const { AclEditor, Template, router, routes } = this.props.bridge;
        const typeval = strings.type;
        const versionval = strings.version;

        if (loading || !citations || !availablePrivileges){
            return <Template title={strings.title} backRoute={routes.CoursesPage}>
                    <Loader />
                </Template>
        }

        if (!entity){
            return <Template title={strings.title} backRoute={routes.CoursesPage}>
                    <Error>Error loading entity</Error>
                </Template>
        }

        const { code, name, description, type, departmentName, citation, students, from, 
            until, versionSelection, archived, security, validationErrors } = entity;
        const { activeTab, changed, canSave, justSaved } = this.state;
        const vs = (versionSelection ? versionSelection : "DEFAULT");
        const fromDate = (from ? parseISO(from) : null);
        const untilDate = (until ? parseISO(until) : null);
        const val = validationErrors || {};

        let rules: TargetListEntry[] = [];
        if (security){
            rules = security!.rules;
        } 

        return <Template title={strings.title} preventNavigation={changed} backRoute={routes.CoursesPage} tabs={
                <Tabs value={activeTab} onChange={this.handleTabChange()} fullWidth>
                    <Tab label={strings.tab} />
                    <Tab label={entityStrings.edit.tab.permissions} />
                </Tabs>}>
                    
            <Snackbar open={justSaved} 
                autoHideDuration={5000} 
                onClose={this.hideSnack} message={<span>{strings.saved}</span>}
                action={<IconButton color="inherit" onClick={this.hideSnack} ><CloseIcon/></IconButton>}
            />
            <div className={classes.body}>
                <div className={this.state.activeTab === 0 ? "" : classes.hiddenTab} style={{ padding: 24 }}>
                    <Grid>
                        <div className={classes.form}>

                            <TextField id="name" 
                                label={strings.name.label}
                                helperText={strings.name.help} 
                                value={name || ''}
                                onChange={this.handleChange('name')}
                                margin="normal"
                                className={classes.formControl2}
                                required
                                error={(val['name'] ? true : false)}
                                />

                            <TextField id="description" 
                                label={strings.description.label} 
                                helperText={strings.description.help} 
                                value={description || ''}
                                onChange={this.handleChange('description')}
                                multiline
                                rows={3}
                                margin="normal"
                                className={classes.formControl2}
                                />

                            <TextField id="code" 
                                label={strings.code.label} 
                                helperText={strings.code.help} 
                                value={code}
                                onChange={this.handleChange('code')}
                                margin="normal"
                                className={classes.formControl}
                                required
                                error={(val['code'] ? true : false)}
                                    />

                            <FormControl margin="normal" className={classes.formControl}>
                                <InputLabel htmlFor="type">{strings.type.label}</InputLabel>
                                <Select id="type" 
                                    value={type}
                                    input={<Input id="type-inp" />}
                                    onChange={this.handleChange('type')}
                                >
                                    <MenuItem key={"i"} value={"Internal"}>{typeval.i}</MenuItem>
                                    <MenuItem key={"e"} value={"External"}>{typeval.e}</MenuItem>
                                    <MenuItem key={"s"} value={"Staff"}>{typeval.s}</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField id="departmentName" 
                                label={strings.department.label}
                                //helperText=""
                                value={departmentName || ''}
                                onChange={this.handleChange('departmentName')}
                                margin="normal"
                                className={classes.formControl}
                                />

                            <FormControl margin="normal" className={classes.formControl}>
                                <InputLabel htmlFor="citation">{strings.citation.label}</InputLabel>
                                <Select id="citation" 
                                    value={citation || ''}
                                    input={<Input id="citation-inp" />}
                                    onChange={this.handleChange('citation')}
                                >
                                    {citations.map((citation) =>
                                    <MenuItem key={citation} value={citation}>
                                        {citation}
                                    </MenuItem>
                                    )}
                                </Select>
                            </FormControl>

                            <DatePicker id="from"
                                label={strings.startdate.label} 
                                format="MMMM Do YYYY"
                                value={fromDate}
                                onChange={this.handleDateChange('from')}
                                clearable 
                                margin="normal"
                                className={classes.formControl}
                                />
                            
                            <DatePicker id="until"
                                label={strings.enddate.label} 
                                format="MMMM Do YYYY"
                                value={untilDate}
                                onChange={this.handleDateChange('until')}
                                clearable
                                margin="normal"
                                className={classes.formControl}
                                />
                            
                            <FormControl margin="normal" className={classes.formControl}>
                                <InputLabel htmlFor="versionSelection">{strings.version.label}</InputLabel>
                                <Select id="versionSelection" 
                                    value={vs}
                                    input={<Input id="versionSelection-inp" />}
                                    onChange={this.handleChange('versionSelection')}
                                    
                                >
                                    <MenuItem key={"DEFAULT"} value={"DEFAULT"}>{versionval.default}</MenuItem>
                                    <MenuItem key={"FORCE_LATEST"} value={"FORCE_LATEST"}>{versionval.forcelatest}</MenuItem>
                                    <MenuItem key={"FORCE_CURRENT"} value={"FORCE_CURRENT"}>{versionval.forcecurrent}</MenuItem>
                                    <MenuItem key={"DEFAULT_TO_LATEST"} value={"DEFAULT_TO_LATEST"}>{versionval.defaultlatest}</MenuItem>
                                    <MenuItem key={"DEFAULT_TO_CURRENT"} value={"DEFAULT_TO_CURRENT"}>{versionval.defaultcurrent}</MenuItem>
                                </Select>
                                <FormHelperText>{strings.version.help}</FormHelperText>
                            </FormControl>

                            <TextField id="students" 
                                label={strings.students.label}
                                //helperText=""
                                value={students || ''}
                                onChange={this.handleChange('students')}
                                margin="normal"
                                className={classes.formControl}
                                />

                            <FormGroup className={classes.formControl}>
                                <FormControlLabel
                                    label={strings.archived.label}
                                    control={<Switch
                                        checked={archived || false}
                                        onChange={this.handleCheckboxChange('archived')}
                                        value="archived"
                                    />}
                                />
                            </FormGroup>
                        </div>
                    </Grid>
                </div>

                <div className={this.state.activeTab === 1 ? "" : classes.hiddenTab } style={{ height: "100%", overflowY: "hidden", padding: 24 }}>
                    { /* TODO: priv list from API */ }
                    <AclEditor 
                        onChange={ this.handleAclChange() }
                        acls={rules} 
                        allowedPrivs={availablePrivileges}/>
                </div>
            </div>

            <Paper component="footer" className={classes.footer}>
                <div className={classes.footerActions}>
                    <Button onClick={router(routes.CoursesPage).onClick} color="secondary">{commonString.action.cancel}</Button>
                    <Button onClick={this.handleSave.bind(this)} color="primary"
                        disabled={!canSave || !changed}>{commonString.action.save}</Button>
                </div>               
            </Paper>
        </Template>
    }
}

function mapStateToProps(state: StoreState): EditCourseStateProps {
    const { course, schema, acl } = state;
    return {
        loading: course.loading,
        entity: course.editingEntity,
        citations: schema.citations,
        availablePrivileges: acl.nodes['COURSE_INFO']
    };
}

function mapDispatchToProps(dispatch: Dispatch<any>): EditCourseDispatchProps {
    const { workers, actions } = courseService;
    
    return {
        loadEntity: (uuid: string) => workers.read(dispatch, {uuid}),
        saveEntity: (entity: Course) => workers.update(dispatch, {entity}),
        modifyEntity: (entity: Course) => dispatch(actions.modify({entity: entity})),
        loadCitations: () => schemaService.workers.citations(dispatch, {}),
        listPrivileges: (node: string) => aclService.workers.listPrivileges(dispatch, {node}),
        validateEntity: (entity: Course) => workers.validate(dispatch, { entity })
    };
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(EditCourse));