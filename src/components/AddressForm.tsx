import { Grid, Typography, LinearProgress, Button } from "@material-ui/core";
import { TextField } from "formik-material-ui";
import { Formik, Form, Field, useFormikContext } from "formik";
import { EmptyHome } from "../models/Home";
import { useDeepCompareEffect } from "react-use";
import { useDebouncedCallback } from "use-debounce";

interface Values {
  address: string;
  city: string;
  county: string;
}

interface Props {
  onSubmit?: (values: Values) => void;
  autosave: boolean;
  initialValues?: Values;
}

export function AutoSave() {
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

export default function AddressForm({
  initialValues,
  onSubmit,
  autosave,
}: Props) {
  return (
    <Formik
      initialValues={initialValues || EmptyHome}
      enableReinitialize={true}
      onSubmit={async (values, actions) => {
        if (onSubmit) {
          await onSubmit(values);
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
              <Field
                component={TextField}
                name="county"
                required
                label="county"
                fullWidth
              />
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
