import { Grid, Typography, LinearProgress, Button } from "@material-ui/core";
import { TextField } from "formik-material-ui";
import { Formik, Form, Field } from "formik";
import { EmptyHome } from "../models/Home";

interface Values {
  address: string;
  city: string;
}

interface Props {
  onSubmit?: (values: Values) => void;
  onChange?: (values: Values) => void;
  initialValues?: Values;
}

function AutoSave({
  values,
  onChange,
}: {
  values: Values;
  onChange: (values: Values) => void;
}) {
  onChange(values);
  return null;
}

export default function AddressForm({
  initialValues,
  onSubmit,
  onChange,
}: Props) {
  return (
    <Formik
      initialValues={initialValues || EmptyHome}
      onSubmit={(values) => {
        if (onSubmit) {
          onSubmit(values);
        }
      }}
    >
      {({ submitForm, isSubmitting, values }) => (
        <Form>
          {onChange && <AutoSave values={values} onChange={onChange} />}
          <Typography variant="h6" gutterBottom>
            Address
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Field
                component={TextField}
                required
                name="address"
                label="Address line 1"
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
          </Grid>
          {isSubmitting && <LinearProgress />}
          {onSubmit && (
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
