import handleException from "../handleException";
import * as Yup from "yup";
import nextId from "react-id-generator";
import { UsaStates, IStateResult } from "usa-states";
import {
  MenuItem,
  Grid,
  Typography,
  LinearProgress,
  Button,
  FormControl,
  InputLabel,
  makeStyles,
  createStyles,
} from "@material-ui/core";
import { TextField, Select } from "formik-material-ui";
import { ErrorMessage, Formik, Form, Field, useFormikContext } from "formik";
import { EmptyHome } from "../models/Home";
import { useDeepCompareEffect } from "react-use";
import { useDebouncedCallback } from "use-debounce";

interface Values {
  address: string;
  city: string;
  stateAbbreviation: string;
}

interface Props {
  onSubmit?: (values: Values) => void;
  autosave: boolean;
  initialValues?: Values;
}

export function AutoSave(): JSX.Element | null {
  const formik = useFormikContext();
  const { dirty, isValid, isSubmitting, values, submitForm } = formik;

  const debounced = useDebouncedCallback(() => {
    if (dirty && isValid && !isSubmitting) {
      submitForm();
    }
  }, 500);

  useDeepCompareEffect(() => {
    debounced.callback();
  }, [values]);

  return null;
}

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      minWidth: 120,
    },
  })
);

const FormSchema = Yup.object().shape({
  address: Yup.string().required("Required"),
  city: Yup.string().required("Required"),
  stateAbbreviation: Yup.string().required("Required"),
});

export default function AddressForm({
  initialValues,
  onSubmit,
  autosave,
}: Props): JSX.Element {
  const styles = useStyles();
  const stateAbbreviationSelectId = nextId();
  return (
    <Formik
      initialValues={initialValues || EmptyHome}
      enableReinitialize={true}
      validationSchema={FormSchema}
      onSubmit={async (values, actions) => {
        if (onSubmit) {
          try {
            await onSubmit(values);
          } catch (e) {
            handleException(e);
          }
        }

        actions.setSubmitting(false);
      }}
    >
      {({ submitForm, isSubmitting }) => (
        <Form>
          {autosave && <AutoSave />}
          <Typography variant="h6" gutterBottom>
            Address
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Field
                component={TextField}
                required
                name="address"
                label="Address"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field
                component={TextField}
                name="city"
                required
                label="City"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl className={styles.formControl}>
                <InputLabel htmlFor={stateAbbreviationSelectId}>
                  State
                </InputLabel>
                <Field
                  component={Select}
                  name="stateAbbreviation"
                  label="State"
                  type="text"
                  required
                  inputProps={{
                    id: stateAbbreviationSelectId,
                  }}
                >
                  <MenuItem></MenuItem>
                  {new UsaStates().states.map((state: IStateResult) => {
                    return (
                      <MenuItem
                        key={state.abbreviation}
                        value={state.abbreviation}
                      >
                        {state.abbreviation}
                      </MenuItem>
                    );
                  })}
                </Field>
                <ErrorMessage name="stateAbbreviation" />
              </FormControl>
            </Grid>
          </Grid>
          {isSubmitting && <LinearProgress />}
          {!autosave && (
            <>
              <br />
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                onClick={submitForm}
              >
                Create Home
              </Button>
            </>
          )}
        </Form>
      )}
    </Formik>
  );
}
