<?php if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Class NF_MergeTags_Fields
 */
final class NF_MergeTags_Fields extends NF_Abstracts_MergeTags
{
    protected $id = 'fields';
    protected $form_id;

    public function __construct()
    {
        parent::__construct();
        $this->title = __( 'Fields', 'ninja-forms' );
        $this->merge_tags = Ninja_Forms()->config( 'MergeTagsFields' );
    }

    public function __call($name, $arguments)
    {
        return $this->merge_tags[ $name ][ 'field_value' ];
    }

    public function all_fields()
    {
        $return = '<table>';
        $hidden_field_types = array( 'html', 'submit' );

        foreach( $this->get_fields_sorted() as $field ){

            if( ! isset( $field[ 'type' ] ) ) continue;
            if( in_array( $field[ 'type' ], array_values( $hidden_field_types ) ) ) continue;

            $field[ 'value' ] = apply_filters( 'ninja_forms_merge_tag_value_' . $field[ 'type' ], $field[ 'value' ], $field );

            if( is_array( $field[ 'value' ] ) ) $field[ 'value' ] = implode( ', ', $field[ 'value' ] );

            $return .= '<tr><td>' . $field[ 'label' ] .':</td><td>' . $field[ 'value' ] . '</td></tr>';
        }
        $return .= '</table>';
        return $return;
    }

    // TODO: Is this being used?
    public function all_field_plain()
    {
        $return = '';

        foreach( $this->get_fields_sorted() as $field ){

            $field[ 'value' ] = apply_filters( 'ninja_forms_merge_tag_value_' . $field[ 'type' ], $field[ 'value' ], $field );

            if( is_array( $field[ 'value' ] ) ) $field[ 'value' ] = implode( ', ', $field[ 'value' ] );

            $return .= $field[ 'label' ] .': ' . $field[ 'value' ] . "\r\n";
        }
        return $return;
    }

    public function add_field( $field )
    {
        $hidden_field_types = apply_filters( 'nf_sub_hidden_field_types', array() );
        if( in_array( $field[ 'type' ], $hidden_field_types ) ) return;

        $field_id  = $field[ 'id' ];
        $callback  = 'field_' . $field_id;

        if( is_array( $field[ 'value' ] ) ) $field[ 'value' ] = implode( ',', $field[ 'value' ] );

        $field[ 'value' ] = strip_shortcodes( $field[ 'value' ] );

        $this->merge_tags[ 'all_fields' ][ 'fields' ][ $field_id ] = $field;

	    $value = apply_filters('ninja_forms_merge_tag_value_' . $field['type'], $field['value'], $field);

	    $this->add( $callback, $field['id'], '{field:' . $field['id'] . '}', $value );

        if( isset( $field[ 'key' ] ) ) {
            $field_key =  $field[ 'key' ];

            // Add Field Key Callback
            $callback = 'field_' . $field_key;
            $this->add( $callback, $field_key, '{field:' . $field_key . '}', $value );

            // Add Field by Key for All Fields
            $this->merge_tags[ 'all_fields_by_key' ][ 'fields' ][ $field_key ] = $field;

            // Add Field Calc Callabck
            $callback = 'field_' . $field_key . '_calc';
            $calc_value = apply_filters( 'ninja_forms_merge_tag_calc_value_' . $field[ 'type' ], $field['value'], $field );
            $this->add( $callback, $field_key, '{field:' . $field_key . ':calc}', $calc_value );
        }
    }

	public function add( $callback, $id, $tag, $value )
	{
		$this->merge_tags[ $callback ] = array(
			'id'          => $id,
			'tag'         => $tag,
			'callback'    => $callback,
			'field_value' => $value,
		);
	}

    public function set_form_id( $form_id )
    {
        $this->form_id = $form_id;
    }

    private function get_fields_sorted()
    {
        $fields = $this->merge_tags[ 'all_fields' ][ 'fields' ];

        // Filterable Sorting for Add-ons (ie Layout and Multi-Part ).
        if ( has_filter( 'ninja_forms_get_fields_sorted' ) ) {
            $fields_by_key = $this->merge_tags[ 'all_fields_by_key' ][ 'fields' ];
            $fields = apply_filters( 'ninja_forms_get_fields_sorted', array(), $fields, $fields_by_key, $this->form_id );
        } else {
            // Default Sorting by Field Order.
            uasort( $fields, array( $this, 'sort_fields' ) );
        }

        return $fields;
    }

    public static function sort_fields( $a, $b )
    {
        if ( $a[ 'order' ] == $b[ 'order' ] ) {
            return 0;
        }
        return ( $a[ 'order' ] < $b[ 'order' ] ) ? -1 : 1;
    }

} // END CLASS NF_MergeTags_Fields
