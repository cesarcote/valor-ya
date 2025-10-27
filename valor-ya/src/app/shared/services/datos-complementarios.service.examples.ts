// Ejemplo de uso del servicio DatosComplementariosService

/*
=== IMPORTACIONES EN EL COMPONENTE ===
import { DatosComplementariosService } from '../../../shared/services/datos-complementarios.service';
import { DatosComplementarios, DatosComplementariosRequest } from '../../../core/models/datos-complementarios.model';

=== INYECCIÓN EN EL COMPONENTE ===
export class MiComponente {
  private datosComplementariosService = inject(DatosComplementariosService);
  
  // O usando constructor:
  // constructor(private datosComplementariosService: DatosComplementariosService) {}

=== EJEMPLOS DE USO ===

// 1. Registrar nuevos datos complementarios
registrarDatosComplementarios(): void {
  const nuevosDatos: DatosComplementariosRequest = {
    lote_id: 'LOT123456789',
    area_construida: 120.5,
    estrato: 3,
    edad: '10-15',
    tipo_predio: 'Apartamento',
    num_ascensores: 2,
    num_banos: 2,
    num_depositos: 1,
    num_habitaciones: 3,
    num_parqueaderos: 1
  };

  this.datosComplementariosService.registrarDatos(nuevosDatos).subscribe({
    next: (datosGuardados) => {
      console.log('Datos registrados exitosamente:', datosGuardados);
      // Mostrar mensaje de éxito al usuario
    },
    error: (error) => {
      console.error('Error al registrar datos:', error);
      // Mostrar mensaje de error al usuario
    }
  });
}

// 2. Obtener datos por Lote ID
obtenerDatosPorLoteId(loteId: string): void {
  this.datosComplementariosService.obtenerPorLoteId(loteId).subscribe({
    next: (datos) => {
      console.log('Datos encontrados:', datos);
      // Usar los datos para llenar un formulario o mostrar información
    },
    error: (error) => {
      console.error('Error al obtener datos:', error);
      // Manejar caso cuando no se encuentran datos
    }
  });
}

// 3. Actualizar datos existentes
actualizarDatos(id: number): void {
  const datosActualizados = {
    num_habitaciones: 4,
    num_banos: 3,
    observaciones: 'Se agregó una habitación adicional'
  };

  this.datosComplementariosService.actualizarDatos(id, datosActualizados).subscribe({
    next: (datosActualizados) => {
      console.log('Datos actualizados:', datosActualizados);
    },
    error: (error) => {
      console.error('Error al actualizar:', error);
    }
  });
}

// 4. Obtener todos los datos (útil para listados)
obtenerTodosLosDatos(): void {
  this.datosComplementariosService.obtenerTodos(1, 10).subscribe({
    next: (listaDatos) => {
      console.log('Lista de datos:', listaDatos);
      // Mostrar en una tabla o lista
    },
    error: (error) => {
      console.error('Error al obtener lista:', error);
    }
  });
}

// 5. Eliminar datos
eliminarDatos(id: number): void {
  if (confirm('¿Está seguro de eliminar estos datos?')) {
    this.datosComplementariosService.eliminarDatos(id).subscribe({
      next: (eliminado) => {
        if (eliminado) {
          console.log('Datos eliminados exitosamente');
          // Actualizar la lista o redirigir
        }
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
      }
    });
  }
}

=== INTEGRACIÓN CON FORMULARIOS REACTIVE ===
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class FormularioComponente {
  formularioDatos: FormGroup;

  constructor(
    private fb: FormBuilder,
    private datosComplementariosService: DatosComplementariosService
  ) {
    this.formularioDatos = this.fb.group({
      lote_id: ['', Validators.required],
      area_construida: [null, [Validators.min(0.01)]],
      estrato: [null, [Validators.min(1), Validators.max(6)]],
      edad: [''],
      tipo_predio: [''],
      num_ascensores: [0, [Validators.min(0)]],
      num_banos: [1, [Validators.min(1)]],
      num_depositos: [0, [Validators.min(0)]],
      num_habitaciones: [1, [Validators.min(1)]],
      num_parqueaderos: [0, [Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.formularioDatos.valid) {
      const datosFormulario = this.formularioDatos.value;
      
      this.datosComplementariosService.registrarDatos(datosFormulario).subscribe({
        next: (resultado) => {
          console.log('Formulario enviado exitosamente:', resultado);
          this.formularioDatos.reset();
        },
        error: (error) => {
          console.error('Error en el formulario:', error);
        }
      });
    }
  }
}
*/

export {}; // Para hacer este archivo un módulo válido